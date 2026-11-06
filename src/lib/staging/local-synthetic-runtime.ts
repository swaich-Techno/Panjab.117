import { randomBytes, randomUUID } from "node:crypto";

import {
  createEncryptedBackup,
  mustSuppressRestoredResponse,
  restoreEncryptedBackup,
  type DeletionLedgerEntry,
  type EncryptedBackupArtifact,
} from "@/lib/security/backup";
import { InMemoryKeyProvider } from "@/lib/security/fake-key-provider";
import {
  InMemoryDurableAuditOutbox,
  InMemoryIdempotentAuditSink,
  processAuditOutboxBatch,
  type SafeAuditOutboxEvent,
} from "@/lib/security/testing/audit-outbox";
import { ScreeningKeyRing } from "@/lib/survey/duplicate-screening";
import {
  createIntakeHttpHandler,
  type IntakeTransportResponse,
  type SafeTransportAuditEvent,
} from "@/lib/survey/intake-http-service";
import { createSyntheticCsrfProof } from "@/lib/survey/intake-readiness";
import {
  InMemorySecureIntakeRepository,
  SafeIntakeError,
  submitSyntheticIntake,
  type SecureSurveyRecord,
} from "@/lib/survey/secure-intake";
import { processSyntheticWithdrawal } from "@/lib/survey/withdrawal-service";

import {
  assertLocalSyntheticStagingConfiguration,
  localSyntheticStagingConfiguration,
  type LocalSyntheticStagingConfiguration,
} from "./production-integration";
import { EmergencyCollectionController } from "./operational-readiness";

type SyntheticSecretName = "csrf" | "withdrawal" | "screening";

export class LocalSyntheticSecretStore {
  readonly #secrets = new Map<SyntheticSecretName, Buffer>();
  #available = true;

  constructor() {
    this.#secrets.set("csrf", randomBytes(32));
    this.#secrets.set("withdrawal", randomBytes(32));
    this.#secrets.set("screening", randomBytes(32));
  }

  read(name: SyntheticSecretName): Buffer {
    if (!this.#available) throw new Error("Synthetic secret store unavailable");
    const value = this.#secrets.get(name);
    if (!value) throw new Error("Synthetic secret is unavailable");
    return Buffer.from(value);
  }

  setAvailable(available: boolean): void {
    this.#available = available;
  }

  destroy(): void {
    for (const value of this.#secrets.values()) value.fill(0);
    this.#secrets.clear();
    this.#available = false;
  }
}

export type QuarantinedRestoreResult = {
  responseId: string;
  state: "suppressed_by_deletion_ledger" | "awaiting_independent_review";
  releaseAllowed: false;
};

export class LocalSyntheticStagingRuntime {
  readonly configuration: LocalSyntheticStagingConfiguration;
  readonly secrets = new LocalSyntheticSecretStore();
  readonly keys = new InMemoryKeyProvider();
  readonly outbox = new InMemoryDurableAuditOutbox();
  readonly auditSink = new InMemoryIdempotentAuditSink();
  readonly edgeAuditEvents: SafeTransportAuditEvent[] = [];
  readonly emergencyController = new EmergencyCollectionController();
  readonly #repository: InMemorySecureIntakeRepository;
  readonly #handler: ReturnType<typeof createIntakeHttpHandler>;
  #databaseAvailable = true;
  #outboxSequence = 0;
  #deletionLedger: DeletionLedgerEntry[] = [];

  constructor(
    configuration: LocalSyntheticStagingConfiguration = localSyntheticStagingConfiguration,
  ) {
    assertLocalSyntheticStagingConfiguration(configuration);
    this.configuration = configuration;
    this.keys.addKey("answer", 1);
    this.keys.addKey("political_answer", 1);
    this.keys.addKey("backup", 1);
    this.#repository = new InMemorySecureIntakeRepository((record, outcome) => {
      this.#outboxSequence += 1;
      this.outbox.enqueue({
        eventId: `step5e-intake-${String(this.#outboxSequence).padStart(8, "0")}`,
        dedupeKey: `intake:${record.responseId}`,
        responseId: record.responseId,
        eventType: "intake_committed",
        outcome:
          outcome.status === "duplicate"
            ? "response_retained_for_duplicate_review"
            : "response_accepted_and_stored",
        maxAttempts: 3,
        availableAt: record.submittedAt,
      });
    });
    this.#handler = createIntakeHttpHandler({
      expectedOrigin: configuration.origin,
      audit: (event) => this.edgeAuditEvents.push(event),
      submit: async (body, request) => {
        this.emergencyController.assertSyntheticStagingEnabled();
        if (!this.#databaseAvailable) {
          throw new SafeIntakeError("service_unavailable");
        }
        return submitSyntheticIntake(body, request, {
          syntheticTestMode: true,
          agePolicyApprovedForSyntheticTest: true,
          expectedOrigin: configuration.origin,
          csrfHmacKey: this.secrets.read("csrf"),
          withdrawalHmacKey: this.secrets.read("withdrawal"),
          withdrawalCodeExpiresAt: "2027-02-05T00:00:00.000Z",
          keyProvider: this.keys,
          screeningKeyRing: new ScreeningKeyRing([
            {
              id: "step5e-synthetic-screening-v1",
              key: this.secrets.read("screening"),
              status: "active",
            },
          ]),
          repository: this.#repository,
          rateLimit: 20,
        });
      },
    });
  }

  start(): void {
    this.emergencyController.enableSyntheticStaging("synthetic_local_only");
  }

  stop(): void {
    this.emergencyController.disable();
  }

  setDatabaseAvailable(available: boolean): void {
    this.#databaseAvailable = available;
  }

  async submitBody(
    body: string,
    now: Date,
    overrides: {
      origin?: string;
      protocol?: "https:" | "http:";
      csrfIssuedAt?: Date;
      csrfSignature?: string;
    } = {},
  ): Promise<IntakeTransportResponse> {
    const origin = overrides.origin ?? this.configuration.origin;
    const token = randomBytes(32).toString("base64url");
    let proof;
    try {
      proof = createSyntheticCsrfProof(
        {
          keyId: "step5e-synthetic-csrf-v1",
          origin,
          cookieToken: token,
          issuedAt: (overrides.csrfIssuedAt ?? now).toISOString(),
        },
        this.secrets.read("csrf"),
      );
    } catch {
      this.edgeAuditEvents.push({
        event: "survey_intake_request",
        correlationId: "step5e-bootstrap-failure",
        occurredAt: now.toISOString(),
        classification: "service_failure",
      });
      return {
        status: 503,
        headers: {
          "cache-control": "no-store, max-age=0",
          "content-type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          error: "The survey response could not be accepted.",
        }),
      };
    }
    return this.#handler({
      method: "POST",
      protocol: overrides.protocol ?? "https:",
      origin,
      contentType: "application/json; charset=utf-8",
      contentLength: String(Buffer.byteLength(body, "utf8")),
      secFetchSite: "same-origin",
      csrfCookieToken: proof.cookieToken,
      headers: {
        "x-p117-csrf-key-id": proof.keyId,
        "x-p117-csrf-token": proof.headerToken,
        "x-p117-csrf-issued-at": proof.issuedAt,
        "x-p117-csrf-signature": overrides.csrfSignature ?? proof.signature,
      },
      body,
      receivedAt: now,
      correlationId: `step5e-${randomUUID()}`,
    });
  }

  getRecord(responseId: string): SecureSurveyRecord | undefined {
    return this.#repository.get(responseId);
  }

  withdraw(
    responseId: string,
    withdrawalCode: string,
    checkedAt: string,
  ): ReturnType<typeof processSyntheticWithdrawal> {
    const record = this.#repository.get(responseId);
    if (!record) throw new Error("Response not found");
    const result = processSyntheticWithdrawal(
      record,
      withdrawalCode,
      checkedAt,
      this.secrets.read("withdrawal"),
      this.#repository,
    );
    if (result.status === "verified_and_deleted") {
      this.#deletionLedger.push(...result.deletionLedger);
      this.#outboxSequence += 1;
      this.outbox.enqueue({
        eventId: `step5e-withdrawal-${String(this.#outboxSequence).padStart(8, "0")}`,
        dedupeKey: `withdrawal:${responseId}`,
        responseId,
        eventType: "withdrawal_completed",
        outcome: "withdrawal_completed",
        maxAttempts: 3,
        availableAt: checkedAt,
      });
    }
    return result;
  }

  createBackup(responseId: string, createdAt: string): EncryptedBackupArtifact {
    const record = this.#repository.get(responseId);
    if (!record) throw new Error("Response not found");
    return createEncryptedBackup(
      Buffer.from(JSON.stringify(record), "utf8"),
      {
        backupId: `step5e-${responseId}`,
        createdAt,
        schemaVersion: "0004_step_5d_audit_outbox",
        databaseVersion: "MySQL 8.4.13 disposable staging",
        deletionLedger: this.#deletionLedger,
      },
      this.keys,
    );
  }

  restoreToQuarantine(
    artifact: EncryptedBackupArtifact,
    backupDeletionLedger: readonly DeletionLedgerEntry[],
    replayDeletionLedger: readonly DeletionLedgerEntry[] = this.#deletionLedger,
  ): QuarantinedRestoreResult {
    const restored = JSON.parse(
      restoreEncryptedBackup(
        artifact,
        backupDeletionLedger,
        this.keys,
      ).toString("utf8"),
    ) as SecureSurveyRecord;
    return {
      responseId: restored.responseId,
      state: mustSuppressRestoredResponse(
        restored.responseId,
        replayDeletionLedger,
      )
        ? "suppressed_by_deletion_ledger"
        : "awaiting_independent_review",
      releaseAllowed: false,
    };
  }

  async processOutbox(
    now: Date,
    workerId = "step5e-worker-0001",
  ): Promise<{ delivered: number; failed: number; deadLettered: number }> {
    return processAuditOutboxBatch({
      store: this.outbox,
      sink: this.auditSink,
      workerId,
      now,
    });
  }

  outboxSnapshot(): readonly SafeAuditOutboxEvent[] {
    return this.outbox.snapshot();
  }

  deletionLedger(): readonly DeletionLedgerEntry[] {
    return this.#deletionLedger.map((entry) => ({ ...entry }));
  }

  destroy(): void {
    this.stop();
    this.secrets.destroy();
    this.keys.removeKey("answer", 1);
    this.keys.removeKey("political_answer", 1);
    this.keys.removeKey("backup", 1);
  }
}

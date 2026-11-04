import { randomUUID } from "node:crypto";

import {
  assertAuthorized,
  type Operation,
  type Role,
} from "@/lib/security/authorization";
import {
  createOwnedDataKey,
  decryptText,
  destroyPlaintextDataKey,
  encryptText,
  type EncryptedEnvelope,
  type KeyProvider,
  type WrappedDataKey,
} from "@/lib/security/encryption";

import {
  CONSENT_NOTICE_DIGEST,
  CONSENT_NOTICE_VERSION,
  issueSyntheticWithdrawalCode,
  proposedAgePolicy,
  type WithdrawalCodeRecord,
} from "./consent";
import { ScreeningKeyRing } from "./duplicate-screening";
import {
  buildSyntheticAtomicClaim,
  type AtomicIntakeClaim,
  type AtomicIntakeOutcome,
  type SyntheticCsrfProof,
  validateSyntheticCsrfProof,
  validateSyntheticSubmission,
} from "./intake-readiness";
import { QUESTIONNAIRE_VERSION } from "./questionnaire";

export const MAX_INTAKE_BODY_BYTES = 32 * 1024;

export const step5AIntakeConfiguration = {
  mode: "synthetic_local_only",
  liveEndpointEnabled: false,
  browserPersistenceEnabled: false,
  databaseProvisioned: false,
  aiProviderEnabled: false,
  agePolicyApproved: proposedAgePolicy.approvedForCollection,
} as const;

export type SafeIntakeErrorCode =
  | "invalid_request"
  | "collection_disabled"
  | "age_policy_unapproved"
  | "request_not_trusted"
  | "service_unavailable";

export class SafeIntakeError extends Error {
  readonly publicMessage = "The survey response could not be accepted.";

  constructor(readonly code: SafeIntakeErrorCode) {
    super(`Secure intake rejected: ${code}`);
    this.name = "SafeIntakeError";
  }
}

export function parseSyntheticIntakeBody(rawBody: string): unknown {
  if (Buffer.byteLength(rawBody, "utf8") > MAX_INTAKE_BODY_BYTES) {
    throw new SafeIntakeError("invalid_request");
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new SafeIntakeError("invalid_request");
  }
}

export type EncryptedAnswerPartition = {
  envelope: EncryptedEnvelope;
  wrappedKey: WrappedDataKey;
};

export type SecureSurveyRecord = {
  responseId: string;
  questionnaireVersion: typeof QUESTIONNAIRE_VERSION;
  consentNoticeVersion: typeof CONSENT_NOTICE_VERSION;
  consentNoticeDigest: typeof CONSENT_NOTICE_DIGEST;
  assemblySegmentNumber: 54 | 55 | 56 | 57 | 58 | 59 | 67 | 69 | 106;
  locale: "en" | "pa" | "hi";
  submittedAt: string;
  politicalConsent: boolean;
  qualityStatus: "included" | "pending_duplicate_review";
  withdrawalState: "active" | "live_data_deleted";
  civic: EncryptedAnswerPartition | null;
  political: EncryptedAnswerPartition | null;
  withdrawalCode: WithdrawalCodeRecord;
  syntheticOnly: true;
};

export type SecureIntakeReceipt = {
  status: AtomicIntakeOutcome["status"];
  responseId: string | null;
  withdrawalCode: string | null;
  storedForHumanReview: boolean;
  acceptedForAnalysis: boolean;
  automaticallyDeleted: false;
};

type StoreState = {
  records: Map<string, SecureSurveyRecord>;
  idempotencySignals: Set<string>;
  payloadSignals: Set<string>;
  rateCounts: Map<string, number>;
};

function cloneState(state: StoreState): StoreState {
  return {
    records: new Map(state.records),
    idempotencySignals: new Set(state.idempotencySignals),
    payloadSignals: new Set(state.payloadSignals),
    rateCounts: new Map(state.rateCounts),
  };
}

export class InMemorySecureIntakeRepository {
  #state: StoreState = {
    records: new Map(),
    idempotencySignals: new Set(),
    payloadSignals: new Set(),
    rateCounts: new Map(),
  };

  constructor(
    private readonly beforeCommit?: (
      record: SecureSurveyRecord,
      outcome: AtomicIntakeOutcome,
    ) => void,
  ) {}

  async commit(
    record: SecureSurveyRecord,
    claim: AtomicIntakeClaim,
  ): Promise<AtomicIntakeOutcome> {
    if (claim.responseId !== record.responseId) {
      throw new Error("Claim ownership mismatch");
    }
    if (this.#state.records.has(record.responseId)) {
      throw new Error("Response ID must be unique");
    }

    const currentRate = Math.max(
      0,
      ...claim.rateSignals.map(
        (signal) => this.#state.rateCounts.get(signal) ?? 0,
      ),
    );
    if (currentRate >= claim.rateLimit) {
      return {
        status: "rate_limited",
        storedForHumanReview: false,
        acceptedForAnalysis: false,
        automaticallyDeleted: false,
      };
    }

    const next = cloneState(this.#state);
    for (const signal of claim.rateSignals) {
      next.rateCounts.set(signal, currentRate + 1);
    }

    if (
      claim.idempotencySignals.some((signal) =>
        this.#state.idempotencySignals.has(signal),
      )
    ) {
      this.#state = next;
      return {
        status: "replay",
        storedForHumanReview: false,
        acceptedForAnalysis: false,
        automaticallyDeleted: false,
      };
    }

    const duplicate = claim.payloadSignals.some((signal) =>
      this.#state.payloadSignals.has(signal),
    );
    const storedRecord: SecureSurveyRecord = duplicate
      ? { ...record, qualityStatus: "pending_duplicate_review" }
      : record;
    claim.idempotencySignals.forEach((signal) =>
      next.idempotencySignals.add(signal),
    );
    if (!duplicate) {
      claim.payloadSignals.forEach((signal) => next.payloadSignals.add(signal));
    }
    next.records.set(record.responseId, storedRecord);

    const outcome: AtomicIntakeOutcome = {
      status: duplicate ? "duplicate" : "accepted",
      storedForHumanReview: true,
      acceptedForAnalysis: !duplicate,
      automaticallyDeleted: false,
    };
    this.beforeCommit?.(storedRecord, outcome);
    this.#state = next;
    return outcome;
  }

  get(responseId: string): SecureSurveyRecord | undefined {
    return this.#state.records.get(responseId);
  }

  replace(record: SecureSurveyRecord): void {
    if (!this.#state.records.has(record.responseId)) {
      throw new Error("Response not found");
    }
    const next = cloneState(this.#state);
    next.records.set(record.responseId, record);
    this.#state = next;
  }

  snapshot(): { records: number; activePayloads: number; rateSignals: number } {
    return {
      records: this.#state.records.size,
      activePayloads: [...this.#state.records.values()].filter(
        ({ civic, political }) => civic !== null || political !== null,
      ).length,
      rateSignals: this.#state.rateCounts.size,
    };
  }
}

function contextFor(
  responseId: string,
  partition: "civic" | "political",
  segment: number,
) {
  const purpose = partition === "civic" ? "answer" : "political_answer";
  return {
    purpose,
    ownerId: responseId,
    schema: "survey",
    table: `${partition}_response_payloads`,
    rowId: responseId,
    field: "answers",
    surveyVersionId: QUESTIONNAIRE_VERSION,
    attributes: { assemblySegmentNumber: String(segment) },
  } as const;
}

function encryptPartition(
  answers: Readonly<Record<string, string | readonly string[]>>,
  responseId: string,
  partition: "civic" | "political",
  segment: number,
  provider: KeyProvider,
): EncryptedAnswerPartition {
  const context = contextFor(responseId, partition, segment);
  const dataKey = createOwnedDataKey(context.purpose, responseId, provider);

  try {
    return {
      envelope: encryptText(JSON.stringify(answers), context, dataKey),
      wrappedKey: dataKey.wrappedKey,
    };
  } finally {
    destroyPlaintextDataKey(dataKey);
  }
}

const allowedSegments = new Set([54, 55, 56, 57, 58, 59, 67, 69, 106]);

function parseSegment(value: string | readonly string[] | undefined) {
  const segment = typeof value === "string" ? Number(value) : Number.NaN;
  if (!allowedSegments.has(segment)) {
    throw new SafeIntakeError("invalid_request");
  }
  return segment as SecureSurveyRecord["assemblySegmentNumber"];
}

export async function submitSyntheticIntake(
  rawBody: string,
  request: {
    origin: string;
    csrfProof: SyntheticCsrfProof;
    now: Date;
  },
  dependencies: {
    syntheticTestMode: boolean;
    agePolicyApprovedForSyntheticTest: boolean;
    expectedOrigin: string;
    csrfHmacKey: Buffer;
    withdrawalHmacKey: Buffer;
    withdrawalCodeExpiresAt: string;
    keyProvider: KeyProvider;
    screeningKeyRing: ScreeningKeyRing;
    repository: InMemorySecureIntakeRepository;
    rateLimit: number;
    createResponseId?: () => string;
  },
): Promise<SecureIntakeReceipt> {
  if (!dependencies.syntheticTestMode) {
    throw new SafeIntakeError("collection_disabled");
  }
  if (!dependencies.agePolicyApprovedForSyntheticTest) {
    throw new SafeIntakeError("age_policy_unapproved");
  }
  if (request.origin !== dependencies.expectedOrigin) {
    throw new SafeIntakeError("request_not_trusted");
  }

  try {
    validateSyntheticCsrfProof(request.csrfProof, {
      expectedOrigin: dependencies.expectedOrigin,
      syntheticHmacKey: dependencies.csrfHmacKey,
      now: request.now,
    });
  } catch {
    throw new SafeIntakeError("request_not_trusted");
  }

  let submission;
  try {
    submission = validateSyntheticSubmission(parseSyntheticIntakeBody(rawBody));
  } catch (error) {
    if (error instanceof SafeIntakeError) throw error;
    throw new SafeIntakeError("invalid_request");
  }

  const responseId = dependencies.createResponseId?.() ?? randomUUID();
  const segment = parseSegment(submission.answers.assembly_segment);
  const civic = encryptPartition(
    submission.answers,
    responseId,
    "civic",
    segment,
    dependencies.keyProvider,
  );
  const political =
    Object.keys(submission.politicalAnswers).length > 0
      ? encryptPartition(
          submission.politicalAnswers,
          responseId,
          "political",
          segment,
          dependencies.keyProvider,
        )
      : null;
  const withdrawal = issueSyntheticWithdrawalCode(
    {
      syntheticResponseId: responseId,
      keyId: "synthetic-withdrawal-hmac-v1",
      issuedAt: request.now.toISOString(),
      expiresAt: dependencies.withdrawalCodeExpiresAt,
    },
    dependencies.withdrawalHmacKey,
  );
  const record: SecureSurveyRecord = {
    responseId,
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    consentNoticeVersion: CONSENT_NOTICE_VERSION,
    consentNoticeDigest: CONSENT_NOTICE_DIGEST,
    assemblySegmentNumber: segment,
    locale: submission.locale,
    submittedAt: request.now.toISOString(),
    politicalConsent: submission.consent.politicalOpinion,
    qualityStatus: "included",
    withdrawalState: "active",
    civic,
    political,
    withdrawalCode: withdrawal.record,
    syntheticOnly: true,
  };
  const claim = buildSyntheticAtomicClaim(submission, {
    responseId,
    keyRing: dependencies.screeningKeyRing,
    rateLimit: dependencies.rateLimit,
  });

  try {
    const outcome = await dependencies.repository.commit(record, claim);
    const stored = outcome.storedForHumanReview;
    return {
      ...outcome,
      responseId: stored ? responseId : null,
      withdrawalCode: stored ? withdrawal.participantCode : null,
    };
  } catch {
    throw new SafeIntakeError("service_unavailable");
  }
}

export type RawAccessContext = {
  role: Role;
  authenticated: boolean;
  mfaVerified: boolean;
  purpose: string;
  approvalId: string;
};

function assertRawAccess(access: RawAccessContext, operation: Operation): void {
  if (
    !access.authenticated ||
    !access.mfaVerified ||
    access.purpose.trim().length < 8 ||
    !/^[A-Za-z0-9_-]{8,128}$/u.test(access.approvalId)
  ) {
    throw new Error("Access denied");
  }
  assertAuthorized(access.role, operation);
}

function decryptPartition(
  record: SecureSurveyRecord,
  partition: "civic" | "political",
  access: RawAccessContext,
  provider: KeyProvider,
): Readonly<Record<string, string | readonly string[]>> {
  assertRawAccess(
    access,
    partition === "civic"
      ? "read_raw_civic_response"
      : "read_raw_political_response",
  );
  if (record.withdrawalState !== "active") {
    throw new Error("Access denied");
  }
  const payload = partition === "civic" ? record.civic : record.political;
  if (!payload) return {};

  return JSON.parse(
    decryptText(
      payload.envelope,
      contextFor(record.responseId, partition, record.assemblySegmentNumber),
      payload.wrappedKey,
      provider,
    ),
  ) as Readonly<Record<string, string | readonly string[]>>;
}

export function readRawCivicAnswers(
  record: SecureSurveyRecord,
  access: RawAccessContext,
  provider: KeyProvider,
) {
  return decryptPartition(record, "civic", access, provider);
}

export function readRawPoliticalAnswers(
  record: SecureSurveyRecord,
  access: RawAccessContext,
  provider: KeyProvider,
) {
  return decryptPartition(record, "political", access, provider);
}

export function createPrivacySafeAuditEvent(input: {
  action: string;
  actorRole: Role;
  responseId: string;
  occurredAt: string;
  outcome: "allowed" | "denied";
}) {
  return {
    eventVersion: 1,
    action: input.action,
    actorRole: input.actorRole,
    responseId: input.responseId,
    occurredAt: input.occurredAt,
    outcome: input.outcome,
  } as const;
}

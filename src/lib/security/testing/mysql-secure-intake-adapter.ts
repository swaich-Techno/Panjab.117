import { randomUUID } from "node:crypto";

import type {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import type { DeletionLedgerEntry } from "@/lib/security/backup";
import {
  verifySyntheticWithdrawalCode,
  type WithdrawalCodeRecord,
} from "@/lib/survey/consent";
import type {
  AtomicIntakeClaim,
  AtomicIntakeOutcome,
} from "@/lib/survey/intake-readiness";
import type {
  SecureIntakeRepository,
  SecureSurveyRecord,
} from "@/lib/survey/secure-intake";
import {
  screeningRetentionWindow,
  syntheticScreeningRetentionPolicy,
  type ScreeningRetentionPolicy,
} from "@/lib/survey/screening-retention";

import { STEP5B_DATABASE } from "./mysql-step5b-migrations";

type ParsedSignal = { keyId: string; digest: Buffer };

type SignalWindow = {
  start: Date;
  end: Date;
  seenAt: Date;
};

export type MysqlAdapterHooks = {
  beforeCommit?: (
    connection: PoolConnection,
    record: SecureSurveyRecord,
  ) => Promise<void> | void;
  afterCommit?: (record: SecureSurveyRecord) => Promise<void> | void;
  onRetry?: (attempt: number, errorCode: string) => void;
  retentionPolicy?: ScreeningRetentionPolicy;
};

export class CollectionApprovalError extends Error {
  constructor() {
    super("Collection approval is not valid for this response");
    this.name = "CollectionApprovalError";
  }
}

export class CommitOutcomeUnknownError extends Error {
  constructor() {
    super("Commit outcome is unknown; retry with the same idempotency key");
    this.name = "CommitOutcomeUnknownError";
  }
}

function uuidToBuffer(value: string): Buffer {
  const normalized = value.replaceAll("-", "");
  if (!/^[0-9a-f]{32}$/iu.test(normalized)) {
    throw new Error("Invalid UUID");
  }
  return Buffer.from(normalized, "hex");
}

export function bufferToUuid(value: Buffer): string {
  if (value.length !== 16) throw new Error("Invalid binary UUID");
  const hex = value.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function digestToBuffer(value: string): Buffer {
  const result = Buffer.from(value, "base64url");
  if (result.length !== 32) throw new Error("Expected a SHA-256 digest");
  return result;
}

function parseSignal(value: string): ParsedSignal {
  const separator = value.indexOf(":");
  if (separator < 1) throw new Error("Invalid screening signal");
  const keyId = value.slice(0, separator);
  const digest = digestToBuffer(value.slice(separator + 1));
  if (!/^[A-Za-z0-9_-]{1,96}$/u.test(keyId)) {
    throw new Error("Invalid screening key ID");
  }
  return { keyId, digest };
}

function submittedDate(record: SecureSurveyRecord): Date {
  const result = new Date(record.submittedAt);
  if (!Number.isFinite(result.getTime()))
    throw new Error("Invalid submission time");
  return result;
}

function outcome(status: AtomicIntakeOutcome["status"]): AtomicIntakeOutcome {
  return {
    status,
    storedForHumanReview: status === "accepted" || status === "duplicate",
    acceptedForAnalysis: status === "accepted",
    automaticallyDeleted: false,
  };
}

function errorCode(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return "UNKNOWN";
}

function retryable(error: unknown): boolean {
  return ["ER_LOCK_DEADLOCK", "ER_LOCK_WAIT_TIMEOUT", "ER_DUP_ENTRY"].includes(
    errorCode(error),
  );
}

async function rollbackQuietly(connection: PoolConnection): Promise<void> {
  try {
    await connection.rollback();
  } catch {
    // A deliberately destroyed test connection cannot receive ROLLBACK.
  }
}

async function findExistingClaim(
  connection: PoolConnection,
  domain: "idempotency" | "answer_duplicate",
  signals: readonly string[],
  window: SignalWindow,
): Promise<Buffer | null> {
  for (const encoded of signals) {
    const signal = parseSignal(encoded);
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT response_id
       FROM ${STEP5B_DATABASE}.survey_screening_claims
       WHERE domain = ? AND screening_key_id = ? AND signal_digest = ?
         AND window_start = ? AND window_end > ?
       LIMIT 1 FOR UPDATE`,
      [domain, signal.keyId, signal.digest, window.start, window.seenAt],
    );
    const responseId = rows[0]?.response_id as Buffer | null | undefined;
    if (responseId) return responseId;
  }
  return null;
}

async function insertClaim(
  connection: PoolConnection,
  domain: "idempotency" | "answer_duplicate",
  signal: string,
  responseId: Buffer,
  window: SignalWindow,
): Promise<void> {
  const parsed = parseSignal(signal);
  await connection.execute(
    `INSERT INTO ${STEP5B_DATABASE}.survey_screening_claims
      (domain, screening_key_id, signal_digest, response_id, claim_count,
       window_start, window_end, last_seen_at, created_at)
     VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)`,
    [
      domain,
      parsed.keyId,
      parsed.digest,
      responseId,
      window.start,
      window.end,
      window.seenAt,
      window.seenAt,
    ],
  );
}

async function incrementRateClaims(
  connection: PoolConnection,
  signals: readonly string[],
  window: SignalWindow,
): Promise<number> {
  let maximum = 0;
  for (const encoded of signals) {
    const signal = parseSignal(encoded);
    await connection.execute(
      `INSERT INTO ${STEP5B_DATABASE}.survey_screening_claims
        (domain, screening_key_id, signal_digest, response_id, claim_count,
         window_start, window_end, last_seen_at, created_at)
       VALUES ('rate_limit', ?, ?, NULL, 1, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         claim_count = claim_count + 1,
         last_seen_at = VALUES(last_seen_at)`,
      [
        signal.keyId,
        signal.digest,
        window.start,
        window.end,
        window.seenAt,
        window.seenAt,
      ],
    );
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT claim_count
       FROM ${STEP5B_DATABASE}.survey_screening_claims
       WHERE domain = 'rate_limit' AND screening_key_id = ?
         AND signal_digest = ? AND window_start = ?
       FOR UPDATE`,
      [signal.keyId, signal.digest, window.start],
    );
    maximum = Math.max(maximum, Number(rows[0]?.claim_count ?? 0));
  }
  return maximum;
}

async function assertApprovedRegistry(
  connection: PoolConnection,
  record: SecureSurveyRecord,
): Promise<void> {
  const submittedAt = submittedDate(record);
  const [rows] = await connection.execute<RowDataPacket[]>(
    `SELECT a.approval_id
     FROM ${STEP5B_DATABASE}.survey_collection_approvals a
     JOIN ${STEP5B_DATABASE}.survey_questionnaire_versions q
       ON q.version_id = a.questionnaire_version_id
     JOIN ${STEP5B_DATABASE}.survey_consent_notice_versions n
       ON n.version_id = a.consent_notice_version_id
      AND n.notice_sha256 = a.consent_notice_sha256
     WHERE a.approval_id = ?
       AND a.questionnaire_version_id = ?
       AND a.consent_notice_version_id = ?
       AND a.consent_notice_sha256 = ?
       AND a.revoked_at IS NULL
       AND a.approved_at <= ? AND a.expires_at > ?
       AND q.approved_for_collection = TRUE
       AND n.translation_reviewed = TRUE
       AND n.legal_reviewed = TRUE
       AND n.approved_for_collection = TRUE
     FOR SHARE`,
    [
      uuidToBuffer(record.collectionApprovalId),
      record.questionnaireVersion,
      record.consentNoticeVersion,
      digestToBuffer(record.consentNoticeDigest),
      submittedAt,
      submittedAt,
    ],
  );
  if (rows.length !== 1) throw new CollectionApprovalError();
}

async function insertEncryptedPartition(
  connection: PoolConnection,
  table: "survey_civic_payloads" | "survey_political_payloads",
  record: SecureSurveyRecord,
): Promise<void> {
  const partition =
    table === "survey_civic_payloads" ? record.civic : record.political;
  if (!partition) return;
  const politicalColumns =
    table === "survey_political_payloads" ? ", political_consent" : "";
  const politicalValue = table === "survey_political_payloads" ? ", TRUE" : "";
  await connection.execute(
    `INSERT INTO ${STEP5B_DATABASE}.${table}
      (response_id${politicalColumns}, envelope_version, algorithm, data_key_id,
       key_locator, key_version, wrapped_key, encrypted_payload, created_at)
     VALUES (?${politicalValue}, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uuidToBuffer(record.responseId),
      partition.envelope.formatVersion,
      partition.envelope.algorithm,
      uuidToBuffer(partition.wrappedKey.dataKeyId),
      partition.wrappedKey.keyId,
      partition.wrappedKey.keyVersion,
      JSON.stringify(partition.wrappedKey),
      JSON.stringify(partition.envelope),
      submittedDate(record),
    ],
  );
}

export class MysqlSecureIntakeTestAdapter implements SecureIntakeRepository {
  constructor(
    private readonly pool: Pool,
    private readonly hooks: MysqlAdapterHooks = {},
    private readonly maxDeadlockRetries = 3,
  ) {}

  async commit(
    record: SecureSurveyRecord,
    claim: AtomicIntakeClaim,
  ): Promise<AtomicIntakeOutcome> {
    if (record.responseId !== claim.responseId) {
      throw new Error("Claim ownership mismatch");
    }
    for (let attempt = 0; attempt <= this.maxDeadlockRetries; attempt += 1) {
      const connection = await this.pool.getConnection();
      let committed = false;
      try {
        await connection.query(
          "SET TRANSACTION ISOLATION LEVEL READ COMMITTED",
        );
        await connection.beginTransaction();
        await assertApprovedRegistry(connection, record);

        const retentionPolicy =
          this.hooks.retentionPolicy ?? syntheticScreeningRetentionPolicy;
        const rateCount = await incrementRateClaims(
          connection,
          claim.rateSignals,
          screeningRetentionWindow(
            retentionPolicy,
            "rate_limit",
            submittedDate(record),
          ),
        );
        if (rateCount > claim.rateLimit) {
          await connection.commit();
          committed = true;
          return outcome("rate_limited");
        }

        const idempotencyWindow = screeningRetentionWindow(
          retentionPolicy,
          "idempotency",
          submittedDate(record),
        );
        const replayResponse = await findExistingClaim(
          connection,
          "idempotency",
          claim.idempotencySignals,
          idempotencyWindow,
        );
        if (replayResponse) {
          await connection.commit();
          committed = true;
          return outcome("replay");
        }
        const duplicateWindow = screeningRetentionWindow(
          retentionPolicy,
          "answer_duplicate",
          submittedDate(record),
        );
        const duplicateResponse = await findExistingClaim(
          connection,
          "answer_duplicate",
          claim.payloadSignals,
          duplicateWindow,
        );
        const isDuplicate = duplicateResponse !== null;
        const responseId = uuidToBuffer(record.responseId);

        await connection.execute(
          `INSERT INTO ${STEP5B_DATABASE}.survey_responses
            (response_id, collection_approval_id, questionnaire_version_id,
             consent_notice_version_id, consent_notice_sha256,
             assembly_segment_number, locale, civic_consent, political_consent,
             submitted_at, quality_status, withdrawal_state, synthetic_only)
           VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?, 'active', TRUE)`,
          [
            responseId,
            uuidToBuffer(record.collectionApprovalId),
            record.questionnaireVersion,
            record.consentNoticeVersion,
            digestToBuffer(record.consentNoticeDigest),
            record.assemblySegmentNumber,
            record.locale,
            record.politicalConsent,
            submittedDate(record),
            isDuplicate ? "pending_duplicate_review" : "included",
          ],
        );
        await insertEncryptedPartition(
          connection,
          "survey_civic_payloads",
          record,
        );
        await insertEncryptedPartition(
          connection,
          "survey_political_payloads",
          record,
        );
        await connection.execute(
          `INSERT INTO ${STEP5B_DATABASE}.survey_withdrawal_receipts
            (response_id, receipt_digest, key_locator, issued_at, expires_at,
             attempts, max_attempts, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            responseId,
            digestToBuffer(record.withdrawalCode.digest),
            record.withdrawalCode.keyId,
            new Date(record.withdrawalCode.issuedAt),
            new Date(record.withdrawalCode.expiresAt),
            record.withdrawalCode.attempts,
            record.withdrawalCode.maxAttempts,
            record.withdrawalCode.status,
          ],
        );
        for (const signal of claim.idempotencySignals) {
          await insertClaim(
            connection,
            "idempotency",
            signal,
            responseId,
            idempotencyWindow,
          );
        }
        if (!isDuplicate) {
          for (const signal of claim.payloadSignals) {
            await insertClaim(
              connection,
              "answer_duplicate",
              signal,
              responseId,
              duplicateWindow,
            );
          }
        }

        await this.hooks.beforeCommit?.(connection, record);
        await connection.commit();
        committed = true;
        await this.hooks.afterCommit?.(record);
        return outcome(isDuplicate ? "duplicate" : "accepted");
      } catch (error) {
        if (!committed) await rollbackQuietly(connection);
        if (
          !committed &&
          retryable(error) &&
          attempt < this.maxDeadlockRetries
        ) {
          this.hooks.onRetry?.(attempt + 1, errorCode(error));
          await new Promise((resolve) =>
            setTimeout(resolve, 5 * (attempt + 1)),
          );
          continue;
        }
        throw error;
      } finally {
        connection.release();
      }
    }
    throw new Error("Deadlock retry budget exhausted");
  }

  async withdraw(input: {
    responseId: string;
    candidateCode: string;
    checkedAt: string;
    syntheticHmacKey: Buffer;
  }): Promise<{
    status:
      | "verified_and_deleted"
      | "invalid"
      | "expired"
      | "locked"
      | "already_redeemed";
    deletionLedger: readonly DeletionLedgerEntry[];
  }> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const responseId = uuidToBuffer(input.responseId);
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT receipt_digest, key_locator, issued_at, expires_at,
                attempts, max_attempts, status
         FROM ${STEP5B_DATABASE}.survey_withdrawal_receipts
         WHERE response_id = ? FOR UPDATE`,
        [responseId],
      );
      const row = rows[0];
      if (!row) throw new Error("Response not found");
      const issuedAt = row.issued_at as Date;
      const expiresAt = row.expires_at as Date;
      const receipt: WithdrawalCodeRecord = {
        syntheticResponseId: input.responseId,
        digest: (row.receipt_digest as Buffer).toString("base64url"),
        keyId: String(row.key_locator),
        issuedAt: issuedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        attempts: Number(row.attempts),
        maxAttempts: Number(row.max_attempts),
        status: row.status as WithdrawalCodeRecord["status"],
        syntheticOnly: true,
      };
      const verification = verifySyntheticWithdrawalCode(
        receipt,
        input.candidateCode,
        input.checkedAt,
        input.syntheticHmacKey,
      );
      await connection.execute(
        `UPDATE ${STEP5B_DATABASE}.survey_withdrawal_receipts
         SET attempts = ?, status = ? WHERE response_id = ?`,
        [verification.record.attempts, verification.record.status, responseId],
      );
      if (verification.outcome !== "verified") {
        await connection.commit();
        return { status: verification.outcome, deletionLedger: [] };
      }

      const [politicalDelete] = await connection.execute<ResultSetHeader>(
        `DELETE FROM ${STEP5B_DATABASE}.survey_political_payloads WHERE response_id = ?`,
        [responseId],
      );
      await connection.execute(
        `DELETE FROM ${STEP5B_DATABASE}.survey_civic_payloads WHERE response_id = ?`,
        [responseId],
      );
      const actions: DeletionLedgerEntry["action"][] = ["destroy_answer_key"];
      if (politicalDelete.affectedRows === 1) {
        actions.push("destroy_political_answer_key");
      }
      const recordedAt = new Date(input.checkedAt);
      const ledger: DeletionLedgerEntry[] = actions.map((action) => ({
        responseId: input.responseId,
        action,
        recordedAt: recordedAt.toISOString(),
      }));
      for (const entry of ledger) {
        await connection.execute(
          `INSERT INTO ${STEP5B_DATABASE}.survey_deletion_ledger
            (deletion_id, response_id, action, recorded_at)
           VALUES (?, ?, ?, ?)`,
          [uuidToBuffer(randomUUID()), responseId, entry.action, recordedAt],
        );
      }
      await connection.execute(
        `INSERT INTO ${STEP5B_DATABASE}.survey_deletion_ledger
          (deletion_id, response_id, action, recorded_at)
         VALUES (?, ?, 'backup_suppression_recorded', ?)`,
        [uuidToBuffer(randomUUID()), responseId, recordedAt],
      );
      await connection.execute(
        `UPDATE ${STEP5B_DATABASE}.survey_responses
         SET withdrawal_state = 'completed' WHERE response_id = ?`,
        [responseId],
      );
      await connection.commit();
      return { status: "verified_and_deleted", deletionLedger: ledger };
    } catch (error) {
      await rollbackQuietly(connection);
      throw error;
    } finally {
      connection.release();
    }
  }
}

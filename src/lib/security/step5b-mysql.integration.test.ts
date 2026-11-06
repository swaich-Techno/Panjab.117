import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import path from "node:path";

import mysql, {
  type Connection,
  type Pool,
  type RowDataPacket,
} from "mysql2/promise";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  CONSENT_NOTICE_DIGEST,
  CONSENT_NOTICE_VERSION,
} from "../survey/consent";
import { ScreeningKeyRing } from "../survey/duplicate-screening";
import { createSyntheticCsrfProof } from "../survey/intake-readiness";
import { QUESTIONNAIRE_VERSION } from "../survey/questionnaire";
import {
  SafeIntakeError,
  submitSyntheticIntake,
} from "../survey/secure-intake";
import { InMemoryKeyProvider } from "./fake-key-provider";
import {
  CommitOutcomeUnknownError,
  MysqlSecureIntakeTestAdapter,
  bufferToUuid,
} from "./testing/mysql-secure-intake-adapter";
import {
  applyStep5DMigrations,
  applyTrackedSql,
  createDisposableDatabase,
  dropDisposableDatabase,
  STEP5B_DATABASE,
  type MigrationResult,
} from "./testing/mysql-step5b-migrations";

const port = Number(process.env.PANJAB_MYSQL_PORT ?? 0);
const binDirectory = process.env.PANJAB_MYSQL_BIN;
const mysqlPassword = process.env.PANJAB_MYSQL_PASSWORD;
const runIntegration =
  Number.isSafeInteger(port) &&
  port > 0 &&
  typeof binDirectory === "string" &&
  binDirectory.length > 0;
const mysqlDescribe = runIntegration ? describe : describe.skip;

const origin = "https://synthetic.step5b.local";
const submittedAt = new Date("2026-11-05T00:00:00.000Z");
const csrfKey = Buffer.alloc(32, 71);
const withdrawalKey = Buffer.alloc(32, 72);
const approvalId = "11111111-1111-4111-8111-111111111111";
const provider = new InMemoryKeyProvider();
provider.addKey("answer", 1, Buffer.alloc(32, 73));
provider.addKey("political_answer", 1, Buffer.alloc(32, 74));
const screeningKeyRing = new ScreeningKeyRing([
  { id: "step5b-screen-v1", key: Buffer.alloc(32, 75), status: "active" },
  {
    id: "step5b-screen-v0",
    key: Buffer.alloc(32, 76),
    status: "retained_for_duplicate_window",
  },
]);

let fixtureSequence = 0;

function binaryUuid(value: string): Buffer {
  return Buffer.from(value.replaceAll("-", ""), "hex");
}

function digest(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

function request() {
  return {
    origin,
    now: submittedAt,
    csrfProof: createSyntheticCsrfProof(
      {
        keyId: "step5b-csrf-v1",
        origin,
        cookieToken: "step5b-csrf-token-000000000000001",
        issuedAt: submittedAt.toISOString(),
      },
      csrfKey,
    ),
  };
}

function rawSubmission(
  input: {
    idempotencyKey?: string;
    privacyScopeToken?: string;
    political?: boolean;
    segment?: string;
    healthcare?: string;
  } = {},
): string {
  fixtureSequence += 1;
  const political = input.political ?? true;
  return JSON.stringify({
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    locale: "en",
    idempotencyKey:
      input.idempotencyKey ?? `step5b-idempotency-${fixtureSequence}`,
    privacyScopeToken:
      input.privacyScopeToken ?? `step5b-privacy-scope-${fixtureSequence}`,
    withdrawalSecret: Buffer.alloc(32, fixtureSequence % 255).toString(
      "base64url",
    ),
    minimumAgeConfirmed: true,
    consent: {
      civicParticipation: true,
      politicalOpinion: political,
      noticeVersion: CONSENT_NOTICE_VERSION,
      noticeDigest: CONSENT_NOTICE_DIGEST,
    },
    answers: {
      assembly_segment: input.segment ?? "54",
      healthcare_access: input.healthcare ?? "good",
    },
    politicalAnswers: political
      ? { representative_responsiveness: "good" }
      : {},
  });
}

async function submit(
  adapter: MysqlSecureIntakeTestAdapter,
  raw: string,
  options: {
    responseId?: string;
    rateLimit?: number;
    collectionApprovalId?: string;
    withdrawalExpiresAt?: string;
  } = {},
) {
  return submitSyntheticIntake(raw, request(), {
    syntheticTestMode: true,
    agePolicyApprovedForSyntheticTest: true,
    expectedOrigin: origin,
    csrfHmacKey: csrfKey,
    withdrawalHmacKey: withdrawalKey,
    withdrawalCodeExpiresAt:
      options.withdrawalExpiresAt ?? "2027-01-01T00:00:00.000Z",
    keyProvider: provider,
    screeningKeyRing,
    repository: adapter,
    rateLimit: options.rateLimit ?? 100,
    collectionApprovalId: options.collectionApprovalId ?? approvalId,
    createResponseId: () => options.responseId ?? randomUUID(),
  });
}

async function expectDatabaseDenial(promise: Promise<unknown>): Promise<void> {
  await expect(promise).rejects.toMatchObject({
    code: expect.stringMatching(/DENIED|ACCESS|COMMAND/),
  });
}

function runMysqlClient(
  executable: "mysql.exe" | "mysqldump.exe",
  additionalArguments: readonly string[],
  input?: Buffer,
): Buffer {
  if (!binDirectory) throw new Error("PANJAB_MYSQL_BIN is required");
  const result = spawnSync(
    path.join(binDirectory, executable),
    [
      "--protocol=tcp",
      "--host=127.0.0.1",
      `--port=${port}`,
      "--user=root",
      ...additionalArguments,
    ],
    {
      cwd: process.cwd(),
      input,
      maxBuffer: 32 * 1024 * 1024,
      windowsHide: true,
      env: mysqlPassword
        ? { ...process.env, MYSQL_PWD: mysqlPassword }
        : process.env,
    },
  );
  if (result.status !== 0) {
    throw new Error(
      `${executable} failed: ${result.stderr.toString("utf8").trim()}`,
    );
  }
  return result.stdout;
}

mysqlDescribe("Step 5B disposable MySQL 8.4 verification", () => {
  let admin: Connection;
  let pool: Pool;
  let migrationResults: readonly MigrationResult[];
  const createdUsers = [
    "p117_step5b_ingest",
    "p117_step5b_civic",
    "p117_step5b_political",
    "p117_step5b_public",
    "p117_step5b_privacy",
    "p117_step5b_audit",
  ] as const;

  beforeAll(async () => {
    admin = await mysql.createConnection({
      host: "127.0.0.1",
      port,
      user: "root",
      password: mysqlPassword,
      multipleStatements: true,
      timezone: "Z",
    });
    await dropDisposableDatabase(admin);
    await dropDisposableDatabase(admin, "panjab117_partial");
    await dropDisposableDatabase(admin, "panjab117_restore");
    await createDisposableDatabase(admin);
    migrationResults = await applyStep5DMigrations(admin);
    pool = mysql.createPool({
      host: "127.0.0.1",
      port,
      user: "root",
      password: mysqlPassword,
      database: STEP5B_DATABASE,
      connectionLimit: 20,
      timezone: "Z",
    });
    await admin.execute(
      `INSERT INTO ${STEP5B_DATABASE}.survey_questionnaire_versions
        (version_id, definition_sha256, approved_for_collection, created_at)
       VALUES (?, ?, TRUE, ?)`,
      [QUESTIONNAIRE_VERSION, Buffer.alloc(32, 81), submittedAt],
    );
    await admin.execute(
      `INSERT INTO ${STEP5B_DATABASE}.survey_consent_notice_versions
        (version_id, notice_sha256, translation_reviewed, legal_reviewed,
         approved_for_collection, created_at)
       VALUES (?, ?, TRUE, TRUE, TRUE, ?)`,
      [CONSENT_NOTICE_VERSION, digest(CONSENT_NOTICE_DIGEST), submittedAt],
    );
    await admin.execute(
      `INSERT INTO ${STEP5B_DATABASE}.survey_collection_approvals
        (approval_id, questionnaire_version_id, consent_notice_version_id,
         consent_notice_sha256, authorization_reference,
         approved_by_directory_id, approved_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        binaryUuid(approvalId),
        QUESTIONNAIRE_VERSION,
        CONSENT_NOTICE_VERSION,
        digest(CONSENT_NOTICE_DIGEST),
        "synthetic-step5b-approval",
        binaryUuid("22222222-2222-4222-8222-222222222222"),
        new Date("2026-11-04T00:00:00.000Z"),
        new Date("2026-12-01T00:00:00.000Z"),
      ],
    );
  }, 60_000);

  afterAll(async () => {
    if (admin) {
      for (const user of createdUsers) {
        await admin.query(`DROP USER IF EXISTS '${user}'@'127.0.0.1'`);
      }
      await dropDisposableDatabase(admin);
      await dropDisposableDatabase(admin, "panjab117_partial");
      await dropDisposableDatabase(admin, "panjab117_restore");
    }
    if (pool) await pool.end();
    if (admin) await admin.end();
  });

  it("runs on the exact isolated MySQL server and applies every tracked migration", async () => {
    const [versionRows] = await admin.query<RowDataPacket[]>(
      `SELECT VERSION() AS version, @@port AS port,
              @@bind_address AS bindAddress, @@general_log AS generalLog,
              @@slow_query_log AS slowQueryLog, @@log_output AS logOutput,
              @@log_bin AS binaryLog`,
    );
    expect(versionRows[0]).toMatchObject({
      version: "8.4.13",
      port,
      bindAddress: "127.0.0.1",
      generalLog: 0,
      slowQueryLog: 0,
      logOutput: "FILE",
      binaryLog: 1,
    });
    expect(migrationResults).toHaveLength(4);
    expect(migrationResults.map(({ outcome }) => outcome)).toEqual([
      "applied",
      "applied",
      "applied",
      "applied",
    ]);

    const [tableRows] = await admin.execute<RowDataPacket[]>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = ? ORDER BY table_name`,
      [STEP5B_DATABASE],
    );
    expect(tableRows.map(({ TABLE_NAME }) => TABLE_NAME)).toEqual([
      "schema_migrations",
      "survey_access_audit",
      "survey_audit_outbox",
      "survey_civic_payloads",
      "survey_collection_approvals",
      "survey_consent_notice_versions",
      "survey_deletion_ledger",
      "survey_export_approvals",
      "survey_political_payloads",
      "survey_questionnaire_versions",
      "survey_responses",
      "survey_screening_claims",
      "survey_screening_cleanup_runs",
      "survey_withdrawal_receipts",
    ]);
    const [foreignKeys] = await admin.execute<RowDataPacket[]>(
      `SELECT DISTINCT constraint_name
       FROM information_schema.key_column_usage
       WHERE table_schema = ? AND referenced_table_name IS NOT NULL
       ORDER BY constraint_name`,
      [STEP5B_DATABASE],
    );
    expect(foreignKeys.map(({ CONSTRAINT_NAME }) => CONSTRAINT_NAME)).toEqual(
      expect.arrayContaining([
        "fk_response_collection_approval",
        "fk_political_response_consent",
        "fk_collection_approval_questionnaire",
        "fk_collection_approval_notice",
      ]),
    );
    const [indexes] = await admin.execute<RowDataPacket[]>(
      `SELECT DISTINCT index_name
       FROM information_schema.statistics
       WHERE table_schema = ? AND index_name IN (?, ?, ?, ?)
       ORDER BY index_name`,
      [
        STEP5B_DATABASE,
        "uq_collection_approval_binding",
        "uq_consent_notice_version_digest",
        "uq_response_political_consent",
        "uq_screening_claim",
      ],
    );
    expect(indexes.map(({ INDEX_NAME }) => INDEX_NAME)).toEqual([
      "uq_collection_approval_binding",
      "uq_consent_notice_version_digest",
      "uq_response_political_consent",
      "uq_screening_claim",
    ]);
    const [requiredColumns] = await admin.execute<RowDataPacket[]>(
      `SELECT table_name, column_name, is_nullable
       FROM information_schema.columns
       WHERE table_schema = ? AND
         ((table_name = 'survey_responses' AND column_name = 'collection_approval_id') OR
          (table_name = 'survey_political_payloads' AND column_name = 'political_consent'))
       ORDER BY table_name, column_name`,
      [STEP5B_DATABASE],
    );
    expect(requiredColumns).toEqual([
      expect.objectContaining({
        TABLE_NAME: "survey_political_payloads",
        COLUMN_NAME: "political_consent",
        IS_NULLABLE: "NO",
      }),
      expect.objectContaining({
        TABLE_NAME: "survey_responses",
        COLUMN_NAME: "collection_approval_id",
        IS_NULLABLE: "NO",
      }),
    ]);
  });

  it("skips exact repeats and rejects a changed checksum", async () => {
    const repeat = await applyStep5DMigrations(admin);
    expect(repeat.map(({ outcome }) => outcome)).toEqual([
      "already_applied",
      "already_applied",
      "already_applied",
      "already_applied",
    ]);
    await expect(
      applyTrackedSql(admin, {
        database: STEP5B_DATABASE,
        version: "0001_step_5a_secure_intake",
        sql: "SELECT 'changed';",
      }),
    ).rejects.toThrow("checksum mismatch");
  });

  it("proves DDL survives ROLLBACK and recovers a partial migration by rebuilding only the disposable schema", async () => {
    await admin.query(`USE ${STEP5B_DATABASE}`);
    await admin.beginTransaction();
    await admin.query("CREATE TABLE ddl_rollback_probe (id INT PRIMARY KEY)");
    await admin.rollback();
    const [ddlRows] = await admin.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM information_schema.tables
       WHERE table_schema = ? AND table_name = 'ddl_rollback_probe'`,
      [STEP5B_DATABASE],
    );
    expect(Number(ddlRows[0]!.count)).toBe(1);
    await admin.query(`DROP TABLE ${STEP5B_DATABASE}.ddl_rollback_probe`);

    await createDisposableDatabase(admin, "panjab117_partial");
    await expect(
      applyTrackedSql(admin, {
        database: "panjab117_partial",
        version: "9999_partial_probe",
        sql: "CREATE TABLE partial_probe (id INT PRIMARY KEY); INVALID STEP5B SQL;",
      }),
    ).rejects.toBeDefined();
    const [partialRows] = await admin.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM information_schema.tables
       WHERE table_schema = 'panjab117_partial' AND table_name = 'partial_probe'`,
    );
    expect(Number(partialRows[0]!.count)).toBe(1);
    const [trackingRows] = await admin.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count
       FROM panjab117_partial.schema_migrations
       WHERE version = '9999_partial_probe'`,
    );
    expect(Number(trackingRows[0]!.count)).toBe(0);
    await dropDisposableDatabase(admin, "panjab117_partial");
    await createDisposableDatabase(admin, "panjab117_partial");
    const [cleanRows] = await admin.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM information_schema.tables
       WHERE table_schema = 'panjab117_partial' AND table_name = 'partial_probe'`,
    );
    expect(Number(cleanRows[0]!.count)).toBe(0);
  });

  it("atomically writes metadata, both ciphertext partitions, consent and screening claims", async () => {
    const adapter = new MysqlSecureIntakeTestAdapter(pool, {
      durableAuditOutbox: true,
      createOutboxEventId: () => "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });
    const receipt = await submit(adapter, rawSubmission());
    expect(receipt.status).toBe("accepted");
    const responseId = binaryUuid(receipt.responseId!);
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT r.collection_approval_id,
              (SELECT COUNT(*) FROM survey_civic_payloads c WHERE c.response_id = r.response_id) AS civic_count,
              (SELECT COUNT(*) FROM survey_political_payloads p WHERE p.response_id = r.response_id) AS political_count,
              (SELECT COUNT(*) FROM survey_withdrawal_receipts w WHERE w.response_id = r.response_id) AS withdrawal_count
       FROM survey_responses r WHERE r.response_id = ?`,
      [responseId],
    );
    expect(rows[0]).toMatchObject({
      civic_count: 1,
      political_count: 1,
      withdrawal_count: 1,
    });
    expect(bufferToUuid(rows[0]!.collection_approval_id as Buffer)).toBe(
      approvalId,
    );
    const [payloadRows] = await pool.execute<RowDataPacket[]>(
      `SELECT CAST(encrypted_payload AS CHAR) AS payload
       FROM survey_civic_payloads WHERE response_id = ?`,
      [responseId],
    );
    expect(String(payloadRows[0]!.payload)).not.toContain("healthcare_access");
    expect(String(payloadRows[0]!.payload)).not.toContain("good");
    const [outboxRows] = await pool.execute<RowDataPacket[]>(
      `SELECT event_type, outcome, state, attempt_count
       FROM survey_audit_outbox WHERE response_id = ?`,
      [responseId],
    );
    expect(outboxRows).toEqual([
      expect.objectContaining({
        event_type: "intake_committed",
        outcome: "response_accepted_and_stored",
        state: "pending",
        attempt_count: 0,
      }),
    ]);
  });

  it("fails closed for unapproved registries and unknown approval IDs", async () => {
    const adapter = new MysqlSecureIntakeTestAdapter(pool);
    await admin.execute(
      `UPDATE ${STEP5B_DATABASE}.survey_questionnaire_versions
       SET approved_for_collection = FALSE WHERE version_id = ?`,
      [QUESTIONNAIRE_VERSION],
    );
    await expect(submit(adapter, rawSubmission())).rejects.toMatchObject({
      code: "service_unavailable",
    });
    await admin.execute(
      `UPDATE ${STEP5B_DATABASE}.survey_questionnaire_versions
       SET approved_for_collection = TRUE WHERE version_id = ?`,
      [QUESTIONNAIRE_VERSION],
    );
    await expect(
      submit(adapter, rawSubmission(), {
        collectionApprovalId: "33333333-3333-4333-8333-333333333333",
      }),
    ).rejects.toBeInstanceOf(SafeIntakeError);

    const civicOnly = await submit(
      adapter,
      rawSubmission({
        political: false,
        segment: "55",
        healthcare: "fair",
      }),
    );
    expect(civicOnly.status).toBe("accepted");

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await expect(
        connection.execute(
          `INSERT INTO survey_political_payloads
            (response_id, political_consent, envelope_version, algorithm,
             data_key_id, key_locator, key_version, wrapped_key,
             encrypted_payload, created_at)
           VALUES (?, TRUE, 1, 'aes-256-gcm', ?, 'synthetic', 1,
                   JSON_OBJECT(), JSON_OBJECT(), ?)`,
          [
            binaryUuid(civicOnly.responseId!),
            binaryUuid("55555555-5555-4555-8555-555555555555"),
            submittedAt,
          ],
        ),
      ).rejects.toMatchObject({ code: "ER_NO_REFERENCED_ROW_2" });
      await connection.rollback();
    } finally {
      connection.release();
    }
  });

  it("handles parallel replay and identical-answer races without unfair deletion", async () => {
    const adapter = new MysqlSecureIntakeTestAdapter(pool);
    const replayRaw = rawSubmission({
      idempotencyKey: "step5b-shared-idempotency",
      privacyScopeToken: "step5b-shared-privacy-scope",
      healthcare: "poor",
    });
    const replayResults = await Promise.all(
      Array.from({ length: 10 }, () => submit(adapter, replayRaw)),
    );
    expect(
      replayResults.filter(({ status }) => status === "accepted"),
    ).toHaveLength(1);
    expect(
      replayResults.filter(({ status }) => status === "replay"),
    ).toHaveLength(9);

    const duplicateResults = await Promise.all(
      Array.from({ length: 6 }, (_, index) =>
        submit(
          adapter,
          rawSubmission({
            idempotencyKey: `step5b-duplicate-idempotency-${index}`,
            privacyScopeToken: `step5b-duplicate-privacy-${index}`,
            healthcare: "very_good",
          }),
        ),
      ),
    );
    expect(
      duplicateResults.filter(({ status }) => status === "accepted"),
    ).toHaveLength(1);
    expect(
      duplicateResults.filter(({ status }) => status === "duplicate"),
    ).toHaveLength(5);
    const duplicateIds = duplicateResults
      .filter(({ status }) => status === "duplicate")
      .map(({ responseId }) => binaryUuid(responseId!));
    const [duplicateRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM survey_responses WHERE quality_status = 'pending_duplicate_review'",
    );
    expect(Number(duplicateRows[0]!.count)).toBeGreaterThanOrEqual(
      duplicateIds.length,
    );
  }, 30_000);

  it("rolls back connection loss before commit and replays safely after uncertain commit", async () => {
    const rollbackResponseId = "77777777-7777-4777-8777-777777777777";
    const ordinaryFailure = new MysqlSecureIntakeTestAdapter(pool, {
      beforeCommit() {
        throw new Error("synthetic pre-commit failure");
      },
    });
    await expect(
      submit(ordinaryFailure, rawSubmission(), {
        responseId: rollbackResponseId,
      }),
    ).rejects.toMatchObject({ code: "service_unavailable" });
    const [rolledBackRows] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM survey_responses WHERE response_id = ?",
      [binaryUuid(rollbackResponseId)],
    );
    expect(Number(rolledBackRows[0]!.count)).toBe(0);

    const lostResponseId = "66666666-6666-4666-8666-666666666666";
    const beforeLoss = new MysqlSecureIntakeTestAdapter(pool, {
      beforeCommit(connection) {
        connection.destroy();
      },
    });
    await expect(
      submit(beforeLoss, rawSubmission(), { responseId: lostResponseId }),
    ).rejects.toMatchObject({ code: "service_unavailable" });
    const [lostRows] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM survey_responses WHERE response_id = ?",
      [binaryUuid(lostResponseId)],
    );
    expect(Number(lostRows[0]!.count)).toBe(0);

    let throwAfterCommit = true;
    const uncertainRaw = rawSubmission({
      idempotencyKey: "step5b-uncertain-commit-idempotency",
      privacyScopeToken: "step5b-uncertain-commit-privacy",
    });
    const uncertain = new MysqlSecureIntakeTestAdapter(pool, {
      afterCommit() {
        if (throwAfterCommit) {
          throwAfterCommit = false;
          throw new CommitOutcomeUnknownError();
        }
      },
    });
    await expect(submit(uncertain, uncertainRaw)).rejects.toMatchObject({
      code: "service_unavailable",
    });
    const replay = await submit(
      new MysqlSecureIntakeTestAdapter(pool),
      uncertainRaw,
    );
    expect(replay.status).toBe("replay");
    const [orphanRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS count
       FROM survey_screening_claims s
       LEFT JOIN survey_responses r ON r.response_id = s.response_id
       WHERE s.response_id IS NOT NULL AND r.response_id IS NULL`,
    );
    expect(Number(orphanRows[0]!.count)).toBe(0);
  });

  it("detects a real InnoDB deadlock and bounds adapter retries", async () => {
    await pool.query(
      "CREATE TABLE deadlock_probe (id INT PRIMARY KEY, value INT NOT NULL) ENGINE=InnoDB",
    );
    await pool.query("INSERT INTO deadlock_probe VALUES (1, 0), (2, 0)");
    const left = await pool.getConnection();
    const right = await pool.getConnection();
    try {
      await left.beginTransaction();
      await right.beginTransaction();
      await left.query("UPDATE deadlock_probe SET value = 1 WHERE id = 1");
      await right.query("UPDATE deadlock_probe SET value = 1 WHERE id = 2");
      const leftWait = left.query(
        "UPDATE deadlock_probe SET value = 2 WHERE id = 2",
      );
      const rightWait = right.query(
        "UPDATE deadlock_probe SET value = 2 WHERE id = 1",
      );
      const results = await Promise.allSettled([leftWait, rightWait]);
      expect(
        results.some(
          (result) =>
            result.status === "rejected" &&
            (result.reason as { code?: string }).code === "ER_LOCK_DEADLOCK",
        ),
      ).toBe(true);
    } finally {
      await Promise.allSettled([left.rollback(), right.rollback()]);
      left.release();
      right.release();
      await pool.query("DROP TABLE deadlock_probe");
    }

    let injected = true;
    const retries: string[] = [];
    const adapter = new MysqlSecureIntakeTestAdapter(pool, {
      beforeCommit() {
        if (injected) {
          injected = false;
          throw Object.assign(new Error("synthetic deadlock"), {
            code: "ER_LOCK_DEADLOCK",
          });
        }
      },
      onRetry(_attempt, code) {
        retries.push(code);
      },
    });
    await expect(
      submit(
        adapter,
        rawSubmission({ segment: "106", healthcare: "very_poor" }),
      ),
    ).resolves.toMatchObject({ status: "accepted" });
    expect(retries).toEqual(["ER_LOCK_DEADLOCK"]);
  }, 30_000);

  it("enforces durable rate windows without creating a rejected response", async () => {
    const adapter = new MysqlSecureIntakeTestAdapter(pool);
    const privacyScopeToken = "step5b-rate-privacy-scope";
    await submit(
      adapter,
      rawSubmission({ privacyScopeToken, healthcare: "fair" }),
      { rateLimit: 1 },
    );
    const blocked = await submit(
      adapter,
      rawSubmission({ privacyScopeToken, healthcare: "poor" }),
      { rateLimit: 1 },
    );
    expect(blocked.status).toBe("rate_limited");
    expect(blocked.responseId).toBeNull();
  });

  it("enforces separated disposable identities and denied operations", async () => {
    const password = randomBytes(24).toString("base64url");
    const roleForUser: Readonly<
      Record<(typeof createdUsers)[number], string | null>
    > = {
      p117_step5b_ingest: "p117_survey_ingest",
      p117_step5b_civic: "p117_civic_reviewer",
      p117_step5b_political: "p117_political_reviewer",
      p117_step5b_public: null,
      p117_step5b_privacy: "p117_privacy_officer",
      p117_step5b_audit: "p117_security_auditor",
    };
    for (const user of createdUsers) {
      await admin.query(`CREATE USER '${user}'@'127.0.0.1' IDENTIFIED BY ?`, [
        password,
      ]);
      const role = roleForUser[user];
      if (role) {
        await admin.query(
          `GRANT '${role}' TO '${user}'@'127.0.0.1'; SET DEFAULT ROLE '${role}' TO '${user}'@'127.0.0.1'`,
        );
      }
    }
    const connect = (user: string) =>
      mysql.createConnection({
        host: "127.0.0.1",
        port,
        user,
        password,
        database: STEP5B_DATABASE,
      });
    const ingest = await connect("p117_step5b_ingest");
    const civic = await connect("p117_step5b_civic");
    const political = await connect("p117_step5b_political");
    const publicConnection = await mysql.createConnection({
      host: "127.0.0.1",
      port,
      user: "p117_step5b_public",
      password,
    });
    const privacy = await connect("p117_step5b_privacy");
    const audit = await connect("p117_step5b_audit");
    try {
      await expect(
        ingest.query("SELECT * FROM survey_collection_approvals"),
      ).resolves.toBeDefined();
      await expectDatabaseDenial(
        ingest.query(
          "INSERT INTO survey_collection_approvals (approval_id) VALUES (0x00)",
        ),
      );
      await expectDatabaseDenial(
        ingest.query("SELECT * FROM survey_civic_payloads"),
      );
      await expectDatabaseDenial(
        ingest.query("SELECT * FROM survey_political_payloads"),
      );
      await expect(
        civic.query("SELECT * FROM survey_civic_payloads"),
      ).resolves.toBeDefined();
      await expectDatabaseDenial(
        civic.query("SELECT * FROM survey_political_payloads"),
      );
      await expect(
        political.query("SELECT * FROM survey_political_payloads"),
      ).resolves.toBeDefined();
      await expectDatabaseDenial(
        political.query("SELECT * FROM survey_civic_payloads"),
      );
      await expectDatabaseDenial(
        publicConnection.query(
          `SELECT * FROM ${STEP5B_DATABASE}.survey_responses`,
        ),
      );
      await expectDatabaseDenial(
        publicConnection.query(
          `SELECT * FROM ${STEP5B_DATABASE}.survey_export_approvals`,
        ),
      );
      await expect(
        privacy.query(
          "SELECT response_id, withdrawal_state FROM survey_responses",
        ),
      ).resolves.toBeDefined();
      await expectDatabaseDenial(
        privacy.query("SELECT assembly_segment_number FROM survey_responses"),
      );
      await expectDatabaseDenial(
        privacy.query("SELECT * FROM survey_civic_payloads"),
      );
      await expect(
        privacy.query("DELETE FROM survey_civic_payloads WHERE 1 = 0"),
      ).resolves.toBeDefined();
      await expect(
        audit.query("SELECT * FROM survey_access_audit"),
      ).resolves.toBeDefined();
      await expectDatabaseDenial(
        audit.query(
          "INSERT INTO survey_access_audit (audit_id, actor_directory_id, actor_role, action, outcome, occurred_at, metadata) VALUES (UUID_TO_BIN(UUID()), UUID_TO_BIN(UUID()), 'audit', 'tamper', 'allowed', NOW(6), JSON_OBJECT())",
        ),
      );
    } finally {
      await Promise.all([
        ingest.end(),
        civic.end(),
        political.end(),
        publicConnection.end(),
        privacy.end(),
        audit.end(),
      ]);
    }
  }, 30_000);

  it("serializes concurrent withdrawal, enforces attempts and removes wrapped keys", async () => {
    const adapter = new MysqlSecureIntakeTestAdapter(pool);
    const receipt = await submit(adapter, rawSubmission());
    const concurrent = await Promise.all([
      adapter.withdraw({
        responseId: receipt.responseId!,
        candidateCode: receipt.withdrawalCode!,
        checkedAt: "2026-11-06T00:00:00.000Z",
        syntheticHmacKey: withdrawalKey,
      }),
      adapter.withdraw({
        responseId: receipt.responseId!,
        candidateCode: receipt.withdrawalCode!,
        checkedAt: "2026-11-06T00:00:00.000Z",
        syntheticHmacKey: withdrawalKey,
      }),
    ]);
    expect(concurrent.map(({ status }) => status).sort()).toEqual([
      "already_redeemed",
      "verified_and_deleted",
    ]);
    const responseId = binaryUuid(receipt.responseId!);
    const [payloadRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         (SELECT COUNT(*) FROM survey_civic_payloads WHERE response_id = ?) AS civic_count,
         (SELECT COUNT(*) FROM survey_political_payloads WHERE response_id = ?) AS political_count,
         (SELECT COUNT(*) FROM survey_deletion_ledger WHERE response_id = ?) AS ledger_count`,
      [responseId, responseId, responseId],
    );
    expect(payloadRows[0]).toMatchObject({
      civic_count: 0,
      political_count: 0,
      ledger_count: 3,
    });

    const lockedReceipt = await submit(adapter, rawSubmission());
    let status = "";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      status = (
        await adapter.withdraw({
          responseId: lockedReceipt.responseId!,
          candidateCode: `invalid-step5b-code-${attempt}`,
          checkedAt: "2026-11-06T00:00:00.000Z",
          syntheticHmacKey: withdrawalKey,
        })
      ).status;
    }
    expect(status).toBe("locked");
    await expect(
      adapter.withdraw({
        responseId: lockedReceipt.responseId!,
        candidateCode: lockedReceipt.withdrawalCode!,
        checkedAt: "2026-11-06T00:00:00.000Z",
        syntheticHmacKey: withdrawalKey,
      }),
    ).resolves.toMatchObject({ status: "locked" });

    const expiredReceipt = await submit(adapter, rawSubmission(), {
      withdrawalExpiresAt: "2026-11-05T01:00:00.000Z",
    });
    await expect(
      adapter.withdraw({
        responseId: expiredReceipt.responseId!,
        candidateCode: expiredReceipt.withdrawalCode!,
        checkedAt: "2026-11-06T00:00:00.000Z",
        syntheticHmacKey: withdrawalKey,
      }),
    ).resolves.toMatchObject({ status: "expired" });
  }, 30_000);

  it("restores a synthetic backup and reapplies the deletion ledger before use", async () => {
    const adapter = new MysqlSecureIntakeTestAdapter(pool);
    const receipt = await submit(adapter, rawSubmission());
    const dump = runMysqlClient("mysqldump.exe", [
      "--single-transaction",
      "--skip-lock-tables",
      "--set-gtid-purged=OFF",
      "--no-tablespaces",
      STEP5B_DATABASE,
    ]);
    await adapter.withdraw({
      responseId: receipt.responseId!,
      candidateCode: receipt.withdrawalCode!,
      checkedAt: "2026-11-06T00:00:00.000Z",
      syntheticHmacKey: withdrawalKey,
    });

    await dropDisposableDatabase(admin, "panjab117_restore");
    await admin.query(
      "CREATE DATABASE panjab117_restore CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci",
    );
    runMysqlClient("mysql.exe", ["--database=panjab117_restore"], dump);
    const responseId = binaryUuid(receipt.responseId!);
    const [beforeSuppression] = await admin.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM panjab117_restore.survey_civic_payloads WHERE response_id = ?",
      [responseId],
    );
    expect(Number(beforeSuppression[0]!.count)).toBe(1);

    const [ledgerRows] = await pool.execute<RowDataPacket[]>(
      "SELECT action FROM survey_deletion_ledger WHERE response_id = ?",
      [responseId],
    );
    expect(ledgerRows.map(({ action }) => action)).toEqual(
      expect.arrayContaining([
        "destroy_answer_key",
        "destroy_political_answer_key",
        "backup_suppression_recorded",
      ]),
    );
    await admin.execute(
      "DELETE FROM panjab117_restore.survey_political_payloads WHERE response_id = ?",
      [responseId],
    );
    await admin.execute(
      "DELETE FROM panjab117_restore.survey_civic_payloads WHERE response_id = ?",
      [responseId],
    );
    await admin.execute(
      "UPDATE panjab117_restore.survey_responses SET withdrawal_state = 'completed' WHERE response_id = ?",
      [responseId],
    );
    const [afterSuppression] = await admin.execute<RowDataPacket[]>(
      `SELECT
         (SELECT COUNT(*) FROM panjab117_restore.survey_civic_payloads WHERE response_id = ?) AS civic_count,
         (SELECT COUNT(*) FROM panjab117_restore.survey_political_payloads WHERE response_id = ?) AS political_count`,
      [responseId, responseId],
    );
    expect(afterSuppression[0]).toMatchObject({
      civic_count: 0,
      political_count: 0,
    });
  }, 60_000);
});

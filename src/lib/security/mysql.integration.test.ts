import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import path from "node:path";

import mysql, {
  type Connection,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  createEncryptedBackup,
  restoreEncryptedBackup,
  type DeletionLedgerEntry,
} from "./backup";
import { InMemoryKeyProvider } from "./fake-key-provider";

const port = Number(process.env.PANJAB_MYSQL_PORT ?? 0);
const binDirectory = process.env.PANJAB_MYSQL_BIN;
const runIntegration = Number.isSafeInteger(port) && port > 0 && binDirectory;
const mysqlDescribe = runIntegration ? describe : describe.skip;

const schemaPath = path.resolve("docs/design/mysql-schema-draft.sql");
const grantsPath = path.resolve("docs/design/mysql-grants.sql");

function binaryId(value: number): Buffer {
  return Buffer.alloc(16, value);
}

function runMysqlClient(
  executable: "mysql.exe" | "mysqldump.exe",
  additionalArguments: readonly string[],
  input?: Buffer,
): Buffer {
  if (!binDirectory) {
    throw new Error("PANJAB_MYSQL_BIN is required");
  }

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
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `${executable} failed: ${result.stderr.toString("utf8").trim()}`,
    );
  }

  return result.stdout;
}

function sourceSql(filePath: string): void {
  runMysqlClient("mysql.exe", [
    "--show-warnings",
    `--execute=SOURCE ${filePath.replaceAll("\\", "/")}`,
  ]);
}

async function expectDatabaseDenial(promise: Promise<unknown>): Promise<void> {
  await expect(promise).rejects.toMatchObject({
    code: expect.stringMatching(/DENIED|ACCESS|COMMAND/),
  });
}

mysqlDescribe("disposable MySQL 8.4 security integration", () => {
  let root: Connection;
  const responseId = binaryId(0x31);
  const surveyVersionId = binaryId(0x21);
  const questionId = binaryId(0x22);
  const identityKeyId = binaryId(0x41);

  beforeAll(async () => {
    root = await mysql.createConnection({
      host: "127.0.0.1",
      port,
      user: "root",
      multipleStatements: true,
    });
    await root.query(
      "SET FOREIGN_KEY_CHECKS = 0; DROP SCHEMA IF EXISTS panjab_confidential; DROP SCHEMA IF EXISTS panjab_public; DROP SCHEMA IF EXISTS panjab_security; SET FOREIGN_KEY_CHECKS = 1;",
    );
    sourceSql(schemaPath);
    sourceSql(grantsPath);
  });

  afterAll(async () => {
    if (root) {
      await root.query(
        "DROP USER IF EXISTS 'p117_test_public'@'127.0.0.1', 'p117_test_ingest'@'127.0.0.1', 'p117_test_backup'@'127.0.0.1'",
      );
      await root.end();
    }
  });

  it("enforces survey/question ownership, DEK ownership, duplicates, rollback, and immutability", async () => {
    const adminId = binaryId(0x10);
    const surveyId = binaryId(0x20);
    const secondSurveyVersionId = binaryId(0x23);
    const secondQuestionId = binaryId(0x24);
    const answerKeyVersionId = binaryId(0x50);
    const identityKeyVersionId = binaryId(0x51);
    const answerKeyId = binaryId(0x40);
    const secondResponseId = binaryId(0x32);
    const secondAnswerKeyId = binaryId(0x44);

    await root.execute(
      "INSERT INTO panjab_security.admin_identities (id, idp_subject_digest, display_label, status, mfa_assurance_required) VALUES (?, ?, 'Synthetic reviewer', 'active', 'phishing_resistant')",
      [adminId, Buffer.alloc(32, 0x10)],
    );
    await root.execute(
      "INSERT INTO panjab_public.survey_definitions (id, survey_code, lifecycle_status) VALUES (?, 'synthetic-security-poc', 'draft')",
      [surveyId],
    );
    await root.execute(
      "INSERT INTO panjab_public.survey_versions (id, survey_id, version_number, privacy_notice_version, workflow_status) VALUES (?, ?, 1, 'synthetic-notice-v1', 'draft'), (?, ?, 2, 'synthetic-notice-v2', 'draft')",
      [surveyVersionId, surveyId, secondSurveyVersionId, surveyId],
    );
    await root.execute(
      "INSERT INTO panjab_public.survey_questions (id, survey_version_id, question_code, question_type, sensitivity_class, is_required, display_order) VALUES (?, ?, 'synthetic-q1', 'single_choice', 'restricted', TRUE, 1), (?, ?, 'synthetic-q2', 'single_choice', 'restricted', TRUE, 1)",
      [questionId, surveyVersionId, secondQuestionId, secondSurveyVersionId],
    );
    await root.execute(
      "UPDATE panjab_public.survey_versions SET workflow_status = 'open' WHERE id IN (?, ?)",
      [surveyVersionId, secondSurveyVersionId],
    );
    await root.execute(
      "INSERT INTO panjab_confidential.response_sessions (id, survey_version_id, response_status, retention_expires_at, submitted_at) VALUES (?, ?, 'submitted', '2027-11-03 00:00:00', CURRENT_TIMESTAMP(6))",
      [responseId, surveyVersionId],
    );
    await root.execute(
      "INSERT INTO panjab_security.encryption_key_versions (id, key_alias, key_reference_digest, purpose, lifecycle_status, activated_at) VALUES (?, 'synthetic-answer-kek-v1', ?, 'answer', 'active', CURRENT_TIMESTAMP(6)), (?, 'synthetic-identity-kek-v1', ?, 'identity', 'active', CURRENT_TIMESTAMP(6))",
      [
        answerKeyVersionId,
        Buffer.alloc(32, 0x50),
        identityKeyVersionId,
        Buffer.alloc(32, 0x51),
      ],
    );
    await root.execute(
      "INSERT INTO panjab_confidential.answer_data_keys (id, response_id) VALUES (?, ?)",
      [answerKeyId, responseId],
    );
    await root.execute(
      "INSERT INTO panjab_confidential.answer_data_key_wraps (id, answer_data_key_id, key_version_id, wrapped_dek, wrapping_algorithm, wrap_status) VALUES (?, ?, ?, ?, 'aes-256-gcm', 'active')",
      [binaryId(0x42), answerKeyId, answerKeyVersionId, Buffer.alloc(48, 0x42)],
    );
    await expect(
      root.execute(
        "DELETE FROM panjab_confidential.answer_data_key_wraps WHERE id = ?",
        [binaryId(0x42)],
      ),
    ).rejects.toMatchObject({ code: "ER_SIGNAL_EXCEPTION" });
    await root.execute(
      "INSERT INTO panjab_confidential.response_sessions (id, survey_version_id, response_status, retention_expires_at) VALUES (?, ?, 'started', '2027-11-03 00:00:00')",
      [secondResponseId, surveyVersionId],
    );
    await root.execute(
      "INSERT INTO panjab_confidential.answer_data_keys (id, response_id) VALUES (?, ?)",
      [secondAnswerKeyId, secondResponseId],
    );
    await root.execute(
      "INSERT INTO panjab_confidential.identity_data_keys (id, response_id) VALUES (?, ?)",
      [identityKeyId, responseId],
    );
    await root.execute(
      "INSERT INTO panjab_confidential.identity_data_key_wraps (id, identity_data_key_id, key_version_id, wrapped_dek, wrapping_algorithm, wrap_status) VALUES (?, ?, ?, ?, 'aes-256-gcm', 'active')",
      [
        binaryId(0x43),
        identityKeyId,
        identityKeyVersionId,
        Buffer.alloc(48, 0x43),
      ],
    );
    await root.execute(
      "INSERT INTO panjab_confidential.response_identities (response_id, identity_data_key_id, identity_ciphertext, nonce, auth_tag, envelope_version, aad_version, retention_expires_at) VALUES (?, ?, ?, ?, ?, 1, 1, '2027-01-01 00:00:00')",
      [
        responseId,
        identityKeyId,
        Buffer.alloc(64, 0x61),
        Buffer.alloc(12, 0x62),
        Buffer.alloc(16, 0x63),
      ],
    );
    await expect(
      root.execute(
        "INSERT INTO panjab_confidential.encrypted_answers (id, response_id, survey_version_id, question_id, answer_data_key_id, ciphertext, nonce, auth_tag, envelope_version, aad_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)",
        [
          binaryId(0x5f),
          responseId,
          surveyVersionId,
          questionId,
          secondAnswerKeyId,
          Buffer.alloc(64),
          Buffer.alloc(12),
          Buffer.alloc(16),
        ],
      ),
    ).rejects.toMatchObject({ code: "ER_NO_REFERENCED_ROW_2" });
    await root.execute(
      "INSERT INTO panjab_confidential.encrypted_answers (id, response_id, survey_version_id, question_id, answer_data_key_id, ciphertext, nonce, auth_tag, envelope_version, aad_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)",
      [
        binaryId(0x60),
        responseId,
        surveyVersionId,
        questionId,
        answerKeyId,
        Buffer.alloc(64, 0x64),
        Buffer.alloc(12, 0x65),
        Buffer.alloc(16, 0x66),
      ],
    );

    await expect(
      root.execute(
        "INSERT INTO panjab_confidential.encrypted_answers (id, response_id, survey_version_id, question_id, answer_data_key_id, ciphertext, nonce, auth_tag, envelope_version, aad_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)",
        [
          binaryId(0x61),
          responseId,
          surveyVersionId,
          secondQuestionId,
          answerKeyId,
          Buffer.alloc(64),
          Buffer.alloc(12),
          Buffer.alloc(16),
        ],
      ),
    ).rejects.toMatchObject({ code: "ER_NO_REFERENCED_ROW_2" });

    await expect(
      root.execute(
        "INSERT INTO panjab_confidential.encrypted_answers (id, response_id, survey_version_id, question_id, answer_data_key_id, ciphertext, nonce, auth_tag, envelope_version, aad_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)",
        [
          binaryId(0x62),
          responseId,
          surveyVersionId,
          questionId,
          answerKeyId,
          Buffer.alloc(64),
          Buffer.alloc(12),
          Buffer.alloc(16),
        ],
      ),
    ).rejects.toMatchObject({ code: "ER_DUP_ENTRY" });

    await expect(
      root.execute(
        "UPDATE panjab_public.survey_versions SET privacy_notice_version = 'changed' WHERE id = ?",
        [surveyVersionId],
      ),
    ).rejects.toMatchObject({ code: "ER_SIGNAL_EXCEPTION" });
    await expect(
      root.execute(
        "UPDATE panjab_public.survey_questions SET question_code = 'changed' WHERE id = ?",
        [questionId],
      ),
    ).rejects.toMatchObject({ code: "ER_SIGNAL_EXCEPTION" });

    const rolledBackResponseId = binaryId(0x70);
    await root.beginTransaction();
    try {
      await root.execute(
        "INSERT INTO panjab_confidential.response_sessions (id, survey_version_id, response_status, retention_expires_at) VALUES (?, ?, 'started', '2027-11-03 00:00:00')",
        [rolledBackResponseId, surveyVersionId],
      );
      await root.execute(
        "INSERT INTO panjab_confidential.encrypted_answers (id, response_id, survey_version_id, question_id, answer_data_key_id, ciphertext, nonce, auth_tag, envelope_version, aad_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)",
        [
          binaryId(0x71),
          rolledBackResponseId,
          surveyVersionId,
          secondQuestionId,
          answerKeyId,
          Buffer.alloc(64),
          Buffer.alloc(12),
          Buffer.alloc(16),
        ],
      );
      throw new Error("Expected the mismatched answer insert to fail");
    } catch {
      await root.rollback();
    }
    const [rollbackRows] = await root.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM panjab_confidential.response_sessions WHERE id = ?",
      [rolledBackResponseId],
    );
    expect(rollbackRows[0]!.count).toBe(0);

    const [indexRows] = await root.execute<RowDataPacket[]>(
      "SELECT DISTINCT index_name FROM information_schema.statistics WHERE table_schema = 'panjab_confidential' AND table_name = 'encrypted_answers'",
    );
    expect(indexRows.map((row) => row.INDEX_NAME)).toEqual(
      expect.arrayContaining([
        "uq_answer_response_question",
        "idx_answer_question_version",
        "idx_answer_key_owner",
      ]),
    );
  });

  it("applies least-privilege MySQL roles and denies cross-role operations", async () => {
    const password = randomBytes(24).toString("base64url");

    await root.query(
      "CREATE USER 'p117_test_public'@'127.0.0.1' IDENTIFIED BY ?",
      [password],
    );
    await root.query(
      "CREATE USER 'p117_test_ingest'@'127.0.0.1' IDENTIFIED BY ?",
      [password],
    );
    await root.query(
      "CREATE USER 'p117_test_backup'@'127.0.0.1' IDENTIFIED BY ?",
      [password],
    );
    await root.query(
      "GRANT 'p117_public_reader' TO 'p117_test_public'@'127.0.0.1'; SET DEFAULT ROLE 'p117_public_reader' TO 'p117_test_public'@'127.0.0.1'",
    );
    await root.query(
      "GRANT 'p117_survey_ingestion' TO 'p117_test_ingest'@'127.0.0.1'; SET DEFAULT ROLE 'p117_survey_ingestion' TO 'p117_test_ingest'@'127.0.0.1'",
    );
    await root.query(
      "GRANT 'p117_backup_operator' TO 'p117_test_backup'@'127.0.0.1'; SET DEFAULT ROLE 'p117_backup_operator' TO 'p117_test_backup'@'127.0.0.1'",
    );

    const connectAs = (user: string) =>
      mysql.createConnection({ host: "127.0.0.1", port, user, password });
    const publicConnection = await connectAs("p117_test_public");
    const ingestConnection = await connectAs("p117_test_ingest");
    const backupConnection = await connectAs("p117_test_backup");

    try {
      await expect(
        publicConnection.query(
          "SELECT * FROM panjab_public.published_research_reports",
        ),
      ).resolves.toBeDefined();
      await expectDatabaseDenial(
        publicConnection.query(
          "SELECT * FROM panjab_confidential.response_sessions",
        ),
      );
      await expectDatabaseDenial(
        ingestConnection.query(
          "SELECT * FROM panjab_confidential.encrypted_answers",
        ),
      );
      await expect(
        backupConnection.query(
          "SELECT COUNT(*) FROM panjab_confidential.response_sessions",
        ),
      ).resolves.toBeDefined();
      await expectDatabaseDenial(
        backupConnection.query(
          "DELETE FROM panjab_confidential.response_sessions",
        ),
      );
    } finally {
      await publicConnection.end();
      await ingestConnection.end();
      await backupConnection.end();
    }
  });

  it("exports, independently encrypts, restores, verifies, and replays deletion ledger", async () => {
    const dump = runMysqlClient("mysqldump.exe", [
      "--single-transaction",
      "--skip-lock-tables",
      "--set-gtid-purged=OFF",
      "--no-tablespaces",
      "--triggers",
      "--databases",
      "panjab_public",
      "panjab_confidential",
      "panjab_security",
    ]);
    const provider = new InMemoryKeyProvider();
    provider.addKey("backup", 1, Buffer.alloc(32, 0x78));
    const ledgerAtBackup: readonly DeletionLedgerEntry[] = [];
    const artifact = createEncryptedBackup(
      dump,
      {
        backupId: "synthetic-mysql-backup-001",
        createdAt: "2026-11-03T12:00:00.000Z",
        schemaVersion: "2b-poc-1",
        databaseVersion: "8.4.13",
        deletionLedger: ledgerAtBackup,
      },
      provider,
    );
    const restoredDump = restoreEncryptedBackup(
      artifact,
      ledgerAtBackup,
      provider,
    );
    const deletionLedger: readonly DeletionLedgerEntry[] = [
      {
        responseId: responseId.toString("hex"),
        action: "destroy_identity_key",
        recordedAt: "2026-11-03T12:05:00.000Z",
      },
    ];

    await root.query(
      "SET FOREIGN_KEY_CHECKS = 0; DROP SCHEMA panjab_confidential; DROP SCHEMA panjab_public; DROP SCHEMA panjab_security; SET FOREIGN_KEY_CHECKS = 1;",
    );
    const restoreStarted = performance.now();
    runMysqlClient("mysql.exe", [], restoredDump);
    const restoreElapsedMs = performance.now() - restoreStarted;

    for (const entry of deletionLedger) {
      if (entry.action === "destroy_identity_key") {
        const restoredResponseId = Buffer.from(entry.responseId, "hex");
        await root.execute(
          "UPDATE panjab_confidential.identity_data_keys SET destroyed_at = CURRENT_TIMESTAMP(6) WHERE response_id = ?",
          [restoredResponseId],
        );
        await root.execute(
          "DELETE FROM panjab_confidential.identity_data_key_wraps WHERE identity_data_key_id IN (SELECT id FROM panjab_confidential.identity_data_keys WHERE response_id = ?)",
          [restoredResponseId],
        );
        await root.execute(
          "DELETE FROM panjab_confidential.response_identities WHERE response_id = ?",
          [restoredResponseId],
        );
      }
    }

    const [identityRows] = await root.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM panjab_confidential.response_identities WHERE response_id = ?",
      [responseId],
    );
    const [wrapRows] = await root.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM panjab_confidential.identity_data_key_wraps w JOIN panjab_confidential.identity_data_keys k ON k.id = w.identity_data_key_id WHERE k.response_id = ?",
      [responseId],
    );
    const [orphanRows] = await root.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM panjab_confidential.encrypted_answers ea LEFT JOIN panjab_confidential.response_sessions rs ON rs.id = ea.response_id WHERE rs.id IS NULL",
    );

    expect(identityRows[0]!.count).toBe(0);
    expect(wrapRows[0]!.count).toBe(0);
    expect(orphanRows[0]!.count).toBe(0);
    expect(restoreElapsedMs).toBeGreaterThan(0);

    const [result] = await root.execute<ResultSetHeader>(
      "INSERT INTO panjab_security.audit_checkpoints (id, from_sequence, to_sequence, event_count, terminal_event_hash, anchor_key_reference_digest, anchor_digest, external_destination, external_receipt_digest) VALUES (?, 1, 1, 1, ?, ?, ?, 'local-separate-anchor-file', ?)",
      [
        binaryId(0x7a),
        Buffer.alloc(32, 0x7a),
        Buffer.alloc(32, 0x7b),
        Buffer.alloc(32, 0x7c),
        Buffer.alloc(32, 0x7d),
      ],
    );
    expect(result.affectedRows).toBe(1);

    process.stdout.write(
      `Synthetic MySQL restore timing: ${restoreElapsedMs.toFixed(2)} ms\n`,
    );
  }, 30_000);
});

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { Connection, RowDataPacket } from "mysql2/promise";

export const STEP5B_DATABASE = "panjab117";

export const step5BMigrations = [
  {
    version: "0001_step_5a_secure_intake",
    path: resolve("database/migrations/mysql/0001_step_5a_secure_intake.sql"),
  },
  {
    version: "0002_step_5a_least_privilege_roles",
    path: resolve(
      "database/migrations/mysql/0002_step_5a_least_privilege_roles.sql",
    ),
  },
  {
    version: "0003_step_5b_verification_hardening",
    path: resolve(
      "database/migrations/mysql/0003_step_5b_verification_hardening.sql",
    ),
  },
] as const;

export type MigrationResult = {
  version: string;
  checksumSha256: string;
  outcome: "applied" | "already_applied";
};

interface MigrationRow extends RowDataPacket {
  checksum_sha256: string;
}

function assertDisposableDatabase(database: string): void {
  if (!/^panjab117(?:_[a-z0-9_]+)?$/u.test(database)) {
    throw new Error("Refusing to operate on a non-disposable database name");
  }
}

function quoteIdentifier(identifier: string): string {
  assertDisposableDatabase(identifier);
  return `\`${identifier}\``;
}

function checksum(sql: string): string {
  return createHash("sha256").update(sql, "utf8").digest("hex");
}

export async function createDisposableDatabase(
  connection: Connection,
  database = STEP5B_DATABASE,
): Promise<void> {
  assertDisposableDatabase(database);
  await connection.query(
    `CREATE DATABASE ${quoteIdentifier(database)} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
  );
  await connection.query(`
    CREATE TABLE ${quoteIdentifier(database)}.schema_migrations (
      version VARCHAR(128) PRIMARY KEY,
      checksum_sha256 CHAR(64) NOT NULL,
      applied_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
    ) ENGINE = InnoDB
  `);
}

export async function dropDisposableDatabase(
  connection: Connection,
  database = STEP5B_DATABASE,
): Promise<void> {
  assertDisposableDatabase(database);
  await connection.query(
    `DROP DATABASE IF EXISTS ${quoteIdentifier(database)}`,
  );
}

export async function applyTrackedSql(
  connection: Connection,
  input: {
    database: string;
    version: string;
    sql: string;
  },
): Promise<MigrationResult> {
  assertDisposableDatabase(input.database);
  if (!/^[0-9a-z_]{3,128}$/u.test(input.version)) {
    throw new Error("Invalid migration version");
  }
  const checksumSha256 = checksum(input.sql);
  const [rows] = await connection.execute<MigrationRow[]>(
    `SELECT checksum_sha256 FROM ${quoteIdentifier(input.database)}.schema_migrations WHERE version = ?`,
    [input.version],
  );
  const existing = rows[0];
  if (existing) {
    if (existing.checksum_sha256 !== checksumSha256) {
      throw new Error(`Migration checksum mismatch: ${input.version}`);
    }
    return {
      version: input.version,
      checksumSha256,
      outcome: "already_applied",
    };
  }

  await connection.query(`USE ${quoteIdentifier(input.database)}`);
  await connection.query(input.sql);
  await connection.execute(
    `INSERT INTO ${quoteIdentifier(input.database)}.schema_migrations (version, checksum_sha256) VALUES (?, ?)`,
    [input.version, checksumSha256],
  );
  return { version: input.version, checksumSha256, outcome: "applied" };
}

export async function applyStep5BMigrations(
  connection: Connection,
): Promise<readonly MigrationResult[]> {
  const results: MigrationResult[] = [];
  for (const migration of step5BMigrations) {
    results.push(
      await applyTrackedSql(connection, {
        database: STEP5B_DATABASE,
        version: migration.version,
        sql: readFileSync(migration.path, "utf8"),
      }),
    );
  }
  return results;
}

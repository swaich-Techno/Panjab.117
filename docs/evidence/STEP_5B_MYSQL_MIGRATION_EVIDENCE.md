# Step 5B MySQL migration evidence

**Scope:** Disposable, loopback-only MySQL 8.4 verification with synthetic data

**Base:** `d208ed0ee884aa215f459b3ea5338947f4b15297`

**Branch:** `feat/step-5b-mysql-security-verification`

## Isolated runtime

MySQL Community Server 8.4.13 LTS was downloaded as the official Windows ZIP,
its published MD5 (`7b94489d5524dea9b27097068bea25a8`) was verified,
and it was extracted under a unique disposable directory outside the
repository. It was not installed as a Windows service. The server accepted TCP
connections only on `127.0.0.1:43306`; MySQL X Protocol and `local_infile` were
disabled and `secure_file_priv` was `NULL`.

The disposable root account had no password. That is acceptable only because
the server was temporary, loopback-bound and held synthetic data. It is
explicitly prohibited for a shared, persistent or production database. See the
[MySQL 8.4 download page](https://dev.mysql.com/downloads/mysql/8.4.html?os=3)
and [Windows ZIP installation guidance](https://dev.mysql.com/doc/refman/8.4/en/windows-extract-archive.html).

## Migration execution

The test runner created only database names matching
`panjab117(?:_[a-z0-9_]+)?`. It applied, in order:

1. `0001_step_5a_secure_intake.sql`
2. `0002_step_5a_least_privilege_roles.sql`
3. `0003_step_5b_verification_hardening.sql`

`schema_migrations` records the version, SHA-256 checksum and application
timestamp. An exact second run returned `already_applied` for all three files;
a changed checksum for an existing version failed closed.

The executable schema inspection confirmed all expected tables, the collection
approval and political-consent foreign keys, the approval/notice/response and
screening unique indexes, and non-null collection approval and political
consent columns.

## DDL failure evidence

A table created inside an explicit transaction remained after `ROLLBACK`,
confirming MySQL's implicit DDL commit behavior. A deliberately invalid
two-statement migration left its first table behind and no migration ledger
row. Recovery dropped and rebuilt only the named disposable schema, then
successfully applied a corrected migration.

Therefore migration rollback is not transactional. Production migration
operations require checksum validation, preflight against a disposable clone,
backup/PITR readiness, a maintenance decision, and an explicit forward-repair
or restore runbook. The test helper must not be treated as a production
migration service.

## Logging and cleanup posture

At verification time `general_log=OFF`, `slow_query_log=OFF`,
`log_output=FILE`, and `log_bin=ON`. Binary logging can retain changed rows and
must be included in production retention, access, encryption and deletion
analysis. After verification, the loopback server, synthetic databases, ZIP
archive, extracted binaries, data directory and binary logs are removed as one
validated disposable directory.

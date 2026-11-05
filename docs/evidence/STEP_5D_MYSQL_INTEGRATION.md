# Step 5D disposable MySQL evidence

## Required target

Disposable MySQL 8.4.13, bound to loopback, with general and slow query logs disabled and binary logging enabled for recovery testing.

The integration suite now applies migrations `0001` through `0004`, checks checksums and reruns, verifies the transactional outbox row, exercises uncertain commits, deadlocks, duplicate races, least-privilege roles, concurrent withdrawal and deletion-ledger restore behavior.

## Verified run — 5 November 2026

- Distribution: official MySQL Community Server 8.4.13 Windows ZIP.
- Archive MD5: `7b94489d5524dea9b27097068bea25a8`, matching Oracle's published value.
- Isolation: `127.0.0.1:51892`; MySQL X disabled; no service installation; no administrator or system-wide change.
- Server identity: `8.4.13`; general log `0`; slow log `0`; binary log `1`; only the four MySQL system schemas existed before migration.
- Credential: a fresh 256-bit root password generated in memory, supplied to tests through process environment only and removed after shutdown.
- Result: 2 test files passed, 15 tests passed, 0 failed, 0 skipped.
- Verified server PIDs: `1524` and `23448`; both exited after graceful shutdown.

Migrations `0001`–`0004` applied in order with checksums, reran as already applied, rejected a changed checksum, and exercised partial-DDL recovery with MySQL's implicit DDL commit behavior. Foreign keys, constraints, indexes and least-privilege identities were verified. The response transaction persisted its fixed, answer-free outbox event atomically.

Two initial assertions failed and were corrected: the expected lexical table order and the expected full outbox outcome classification. These were test defects; the database values were correct.

Local-only exceptions: initialization briefly used `--initialize-insecure` before the loopback server received the random password; TLS was supported with a generated self-signed certificate but not required by clients. These settings are not acceptable for production. Binary logging was intentionally enabled for restore testing.

Outbox delivery retry, deduplication, dead-letter transitions, worker restart and screening cleanup execution remain deterministic in-memory security-model tests. MySQL verified the transactional outbox persistence and schema/privilege boundaries, not an external production audit sink or scheduled cleanup worker.

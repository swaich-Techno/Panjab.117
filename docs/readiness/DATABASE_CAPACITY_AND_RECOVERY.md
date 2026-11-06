# Database capacity and recovery

Status: schema and synthetic adapters available; no production database.

The migrations define encrypted civic and political payload separation,
versioned consent, idempotency, screening signals, withdrawal/deletion state,
least-privilege roles and transactional audit/outbox records. Production must
apply them through an approved migration identity, never the intake identity.

The 4,500 minimum is small in storage terms, but capacity approval must include
responses above target, indexes, audit/outbox growth, deletion ledgers,
screening material, backups, connection limits and peak concurrency. A load
test must use realistic encrypted payload sizes and demonstrate failure-safe
behavior; simple row capacity is not sufficient evidence.

Required recovery controls:

- encrypted automatic backups and point-in-time recovery;
- a separate backup key and restricted restore identity;
- immutable or independently protected deletion ledger;
- quarantine restore with no outbound delivery;
- deletion-suppression replay before any restored data is released;
- documented RPO/RTO and scheduled witnessed restore exercises;
- post-close withdrawal availability through the approved retention period.

Oracle documents that Always Free MySQL has one-day automatic backup retention,
no manual backup, no point-in-time recovery, no HA, no SLA and no support:
https://docs.oracle.com/en-us/iaas/mysql-database/doc/features-mysql-heatwave-service.html
That is insufficient for this production recovery design.

The MySQL integration command in this worktree skipped all 15 integration
tests because no disposable MySQL server was active. Earlier Step 5 evidence is
useful historical evidence but does not constitute a fresh run for this changed
tree. In-memory atomic/concurrency and failure-path tests passed; production
database capacity, contention and recovery remain unverified.

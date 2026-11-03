# Backup, recovery, and disaster plan

Status: proposed production runbook with one disposable synthetic MySQL restore exercise. Production recovery remains **not operationally proven**.

## Service limitation

Oracle documents an automatic Always Free backup with one-day retention. Manual backups and point-in-time recovery are unavailable; HA, read replicas, SLA, and Oracle Support are also absent. This creates single-region, single-system, and operator-error exposure. The native backup is a convenience, not the Panjab 117 recovery strategy.

## Recovery objectives

Provisional objectives pending product/privacy approval:

| Data/service                                    | Target RPO                        | Target RTO                         | Free-tier confidence                                                                             |
| ----------------------------------------------- | --------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| Public Git-backed content/schema                | one accepted commit               | 4 hours                            | Reasonable if repository and artifacts remain available                                          |
| Public DB workflow state                        | 24 hours                          | 24 hours                           | Possible but not guaranteed                                                                      |
| Confidential responses during an approved pilot | 4 hours desired; 24 hours maximum | 24 hours desired; 72 hours maximum | **Not reliably achievable** without frequent jobs, spare capacity, monitoring, and restore proof |
| Identity/consent deletion state                 | 4 hours                           | 24 hours                           | High risk of resurrection from backups; deletion ledger and restore replay required              |

RPO/RTO are objectives, not promises. Always Free has no SLA and replacement capacity may be unavailable. Confidential collection must pause if backup freshness exceeds the approved RPO.

## Independent backup design

1. A private OCI backup runner uses a dedicated `backup_reader` MySQL account over verified TLS.
2. At least every four hours during collection, create a transactionally consistent logical dump using an exact-version-tested MySQL Shell dump or `mysqldump --single-transaction` workflow. Capture routines/events only if explicitly used and reviewed.
3. Stream into a temporary encrypted filesystem or memory-bounded pipeline; never leave an unencrypted artifact on persistent disk.
4. Generate a random per-backup DEK, encrypt the backup with an established authenticated-encryption/file format, and wrap the DEK with the backup-specific OCI Vault key.
5. Produce a signed/authenticated manifest containing schema version, tool/version, start/end time, database consistency coordinates when available, table/row counts, encrypted-object digest, key-version reference, and retention class. It contains no row data or secret.
6. Upload ciphertext and manifest to a dedicated Object Storage bucket/prefix controlled by the backup operator, not the runtime app. Enable versioning/retention protection if verified available and affordable in the selected tenancy.
7. Verify upload size/digest and attempt a non-destructive decrypt/readability check on every backup. Alert on missed, late, unexpectedly small/large, or unverifiable artifacts.
8. Export audit evidence to a separately controlled destination so database destruction does not remove the incident record.

Oracle's 20 GB Always Free Object Storage allowance may be too small for retained encrypted dumps and restore staging. API request limits, object versioning/retention behavior, and cross-region copy costs must be measured. No automatic deletion should run until at least one newer restore point has passed verification.

## Separation of duties

- Runtime application cannot list, read, overwrite, or delete backups.
- Backup runner can read DB for backup and write only its bucket prefix; it cannot modify tables or manage Vault keys.
- Backup operator can run/verify jobs but cannot decrypt survey fields in the application.
- Key administrator controls backup KEK lifecycle but cannot read DB or approve their own destructive action.
- Backup deletion/retention shortening requires privacy/data owner plus security approval and an audit case.

## Retention proposal

Subject to legal/privacy approval and 20 GB capacity measurement:

- Every 4 hours: 48 hours.
- Daily: 30 days.
- Weekly: 12 weeks.
- Monthly: only if a documented research/legal need exists; otherwise do not retain indefinitely.
- Security/audit evidence: separate schedule based on incident and legal requirements.

Backups inherit the highest classification of their content. When a subject deletion or consent withdrawal must survive restoration, record a minimal encrypted deletion ledger separately and replay it immediately after any restore before the environment is accessible. Expired backup keys/artifacts are destroyed only through the approved retention workflow.

## Restore test procedure

Quarterly, and before confidential launch or material schema/key change:

1. Open a recovery ticket and select a backup without exposing filenames that reveal respondent information.
2. Create an isolated, non-public recovery environment with no email, webhook, analytics, or general Internet egress.
3. Obtain two-person approval for backup-key use; decrypt into ephemeral protected storage.
4. Validate manifest/digest, import schema/data, and record tool warnings/errors.
5. Run integrity checks: table counts, FK/orphan checks, schema version, representative synthetic decryption, consent links, audit-chain continuity, and application smoke tests.
6. Replay the deletion ledger and verify expired/deleted subjects are absent.
7. Measure achieved RPO and RTO; record evidence and remediation.
8. Securely destroy the recovery environment and temporary plaintext after approval. Rotate any exposed temporary credentials.

A successful file upload, checksum, or import alone is not a restoration test.

## Step 2B local exercise

On 2026-11-03, the test suite used MySQL Community Server 8.4.13 on loopback with synthetic neutral values only. It performed a `mysqldump --single-transaction --skip-lock-tables --set-gtid-purged=OFF --no-tablespaces` export into memory, independently encrypted/authenticated it with the backup-only hierarchy, verified and decrypted it, dropped only the disposable schemas, restored them, checked for orphaned answers, and replayed an identity-key deletion ledger. A deliberately corrupted artifact and a mismatched ledger were rejected by unit tests.

The final measured tiny-fixture restore was 1846.18 ms on this workstation. This is reproducibility evidence, not a production RTO/RPO or capacity result. It did not test OCI Object Storage, Vault, network interruption, large datasets, cross-region recovery, operator approval, or provider failure.

## Disaster runbook

1. Stop survey writes and display a neutral unavailable message; preserve public read-only content if safe.
2. Revoke compromised application/DB identities, isolate affected workloads, and preserve logs/evidence.
3. Determine incident time and whether keys, backups, or deletion state are affected.
4. Choose the latest independently verified pre-incident backup; do not overwrite the failed system.
5. Provision a clean private environment, restore in isolation, replay deletions, rotate credentials/keys as required, and security-test it.
6. Privacy/security owners approve reopening. Reconcile idempotent submissions where possible; never ask respondents to reveal prior answers to support recovery.
7. Notify affected parties/regulators when required by the approved incident/legal process.
8. Complete post-incident review and update controls/RPO evidence.

## Requirements not reliably met by free tier

- Multi-node high availability and automatic failover.
- Point-in-time recovery and longer managed-backup retention.
- Guaranteed replacement capacity, cross-region disaster recovery, SLA, or vendor support.
- Sufficient independent backup storage for unknown volumes and long retention.
- Guaranteed 4-hour RPO/24-hour RTO without continuously monitored compute and storage.
- Immutable cross-account/cross-region copies without confirming features and possible charges.

Before production confidential data, either fund these controls or formally accept reduced availability/recovery with a strict low-volume pilot and immediate shutdown thresholds.

## Sources verified 2026-11-03

- [Oracle MySQL HeatWave service features](https://docs.oracle.com/en-us/iaas/mysql-database/doc/features-mysql-heatwave-service.html)
- [Oracle point-in-time recovery](https://docs.oracle.com/en-us/iaas/mysql-database/doc/point-time-recovery.html)
- [Oracle Always Free resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)

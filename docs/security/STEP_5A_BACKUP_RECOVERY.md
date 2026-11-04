# Step 5A backup, recovery and deletion

## Required production objectives

RPO, RTO, retention duration and legal hold rules require owner approval.
Until then, no provider default is accepted as policy. A production design
must provide encrypted automated backups, point-in-time recovery, geographic
placement approved by legal/privacy review, independent access control,
integrity manifests and regularly tested restoration.

## Proposed procedure

1. Quiesce or use a transactionally consistent snapshot.
2. Create an encrypted logical/physical backup with schema version, database
   version, timestamp, plaintext digest and deletion-ledger digest.
3. Store it under a backup-only identity; application and analyst roles cannot
   read it.
4. Restore into an isolated recovery environment with no public ingress.
5. Verify manifest, schema, row counts and cryptographic integrity.
6. Apply the current deletion ledger before allowing any service or export.
7. Confirm withdrawn response keys/payloads are absent and record the recovery
   exercise without answers.
8. Destroy the recovery copy and credentials under the approved procedure.

## Provider findings

Cloudflare D1 Time Travel is always on, but Free-plan history is seven days and
a restore overwrites the database; this is not a complete independent backup
policy. Oracle MySQL HeatWave Always Free has one-day automatic backup
retention and lacks manual backup, PITR, HA, SLA and support. These limits make
both free offerings insufficient as the sole recovery control for confidential
collection.

References:

- [Cloudflare D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
- [Oracle MySQL HeatWave Always Free restrictions](https://docs.oracle.com/en-us/iaas/mysql-database/doc/features-mysql-heatwave-service.html)
- [MySQL backup and recovery](https://dev.mysql.com/doc/refman/8.4/en/backup-and-recovery.html)

## Step 5A evidence

The existing synthetic backup format authenticates its manifest and deletion
ledger. The Step 5A withdrawal service emits civic and political key-destruction
entries. It does not connect to storage, schedule backups or claim a tested
provider restore.

# Step 5E launch operations

Date: 5 November 2026

Status: procedures only; no launch or infrastructure is approved

## Current control record

| Control                      | State |
| ---------------------------- | ----- |
| Live collection              | false |
| Final launch approval        | false |
| Production security approval | false |
| Privacy approval             | false |
| Consent approval             | false |
| Backup/recovery approval     | false |
| Operations approval          | false |
| AI provider                  | false |

## Synthetic staging start and stop

1. Confirm the isolated worktree and clean base.
2. Use only generated synthetic responses.
3. Create the short-lived PFX under ignored `work/`; never commit it.
4. Bind `127.0.0.1` only and verify TLS 1.3.
5. Start the disposable MySQL listener on loopback only when database tests are authorized.
6. Run focused workflow, failure, backup, withdrawal and restore tests.
7. Stop the browser harness and MySQL, verify processes and listeners are gone, delete temporary runtime files, and confirm Git status.

## Future secret rotation

1. Emergency-close intake if exposure is suspected.
2. Create a new secret version in the approved managed secret store.
3. Grant only the workload identity and dual-approved emergency operators.
4. Roll the signed service release; verify both old and new versions only for the documented overlap.
5. Revoke the old version, test withdrawal/retry behavior and record answer-free evidence.
6. Investigate exposure and follow incident notification requirements. Never print secret values.

## Future key rotation

Maintain separate civic, political and backup authorization boundaries. Create a new non-exportable KEK version, make it active for new envelopes, retain old versions only for approved decryption/retention, test restore in quarantine, and destroy retired versions only after retention, legal hold and recovery requirements are satisfied. One operator must not control all three domains.

## Backup and restore drill

1. Verify the encrypted backup manifest, schema/database version and independent deletion-ledger evidence.
2. Restore to a new isolated quarantine database, never over the active database.
3. Apply migrations forward and replay the complete deletion ledger.
4. Verify withdrawn responses are suppressed and keys unavailable.
5. Run integrity, authorization and aggregate checks using synthetic data.
6. Require privacy plus recovery approval before any release; the application never auto-promotes a restore.
7. Record RPO/RTO, evidence digest, participants and corrections without response content.

## Emergency shutdown

The first action is to close intake while keeping the privacy/withdrawal channel available if safe. Revoke the intake workload identity, block ingress, preserve logs/evidence, assess incident scope, rotate affected secrets/keys, notify the authorized incident lead and follow legally reviewed notification procedures. Reopening requires a new release-bound approval; changing an environment flag alone is insufficient.

## Administrator deprovisioning

Disable the identity and active sessions immediately; remove groups and database grants; rotate shared emergency material if any; recover devices; review recent activity; update break-glass custody; and record two-person evidence. No permanent shared administrator account is allowed.

## Launch sequence — future and separately authorized

Provision disabled infrastructure; verify private networking/TLS/identity/KMS; migrate; test backups/PITR/alerts; complete independent reviews; verify budget/funding; bind signed evidence to the exact commit and image; obtain all five operational approvals; obtain final launch approval; run a synthetic smoke test; then perform a separate two-person activation. Any failed check stops launch.

## Rollback

Close intake, preserve the withdrawal path and evidence, return to the last signed application image, use forward migration repair, and restore only into quarantine. Never reset, overwrite or destructively roll back the production database. The existing Cloudflare static preview remains independent and unchanged.

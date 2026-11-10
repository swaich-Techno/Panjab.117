# PANJAB 117 aggregate-only synchronization

Status: installation-ready, collection-disabled, and not scheduled.

This private Apps Script reads only manually approved aggregate rows from the
four Restricted round workbooks. It has no `doGet` or `doPost` handler, never
reads response-level tabs, excludes synthetic probes from genuine totals, and
holds EXIT data outside the master synchronization.

## Owner installation

1. Sign in to Google Apps Script with the owner account and confirm MFA.
2. Create a private project named `PANJAB 117 - Aggregate Sync (Private)`.
3. Replace `Code.gs` with the reviewed file in this directory. Add
   `appsscript.json` only through the manifest editor. Do not deploy a Web App.
4. In Project settings, create these Script Properties:

   - `PANJAB117_MASTER_SHEET_ID`
   - `PANJAB117_PRE1_SHEET_ID`
   - `PANJAB117_PRE2_SHEET_ID`
   - `PANJAB117_PRE3_SHEET_ID`
   - `PANJAB117_EXIT_SHEET_ID`
   - `PANJAB117_SYNC_ENABLED=false`

5. Save and run `dryRunAggregateSync` only. Review the exact Google scopes
   before approving them. The dry run writes no cells and creates no trigger.
6. Confirm the execution report says `participantCollectionEnabled: false`,
   `exitRoundHeld: true`, and shows zero approved rows unless a genuine human
   approval record already exists.
7. Keep synchronization disabled until a separate technical approval. A later
   approved first write should run `syncApprovedAggregates` once, verify
   `Approved_Aggregates` and `Sync_Audit`, and only then consider
   `installHourlyAggregateTrigger`.

## Approval and reconciliation behavior

- `Aggregate_Approvals` is the sole approval register.
- Only `APPROVED` rows with a reviewer and review time are eligible.
- `PENDING`, `REJECTED`, `REVOKED`, malformed, cross-round and unreviewed rows
  do not enter the master.
- Each run reconciles the complete approved snapshot. Corrections replace the
  deterministic record; revoked or removed approvals remove stale managed
  rows. Existing `SYNTHETIC-*` diagnostic rows are preserved but excluded from
  genuine counts.
- One locked, padded write replaces the managed master rectangle and is read
  back before a success audit is appended. Retrying the same state is
  idempotent.
- EXIT is always held, even if an approval row exists.

## Emergency stop

Run `disableAggregateSynchronization`. It sets the private property to `false`
and removes this project's hourly synchronization trigger. It does not enable
or disable public survey intake; collection remains a separate NO-GO decision.

## Local synthetic verification

Run:

```text
npm run test:google-sheets-sync
```

The test covers sharing rejection, approval gating, synthetic exclusion,
duplicate-free retries, corrections, revocations, EXIT isolation, failure
auditing, trigger uniqueness and emergency shutdown. Local mocks are not a
substitute for an authenticated Apps Script dry run or quota measurement.

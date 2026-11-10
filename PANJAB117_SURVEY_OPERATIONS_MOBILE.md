# PANJAB 117 mobile survey operations

Status: collection disabled; synthetic administration only.

## Secure access

- Use the owner Google account with MFA and a screen lock.
- Do not forward spreadsheet links or use a shared browser profile.
- Confirm General access says **Restricted** before entering any approved data.
- The five original workbooks were last verified Restricted and owner-only on
  10 November 2026. Recheck before every operational session. This verification
  does not authorize real response collection.

## Daily navigation

- Master Dashboard: open the private `Dashboard` file in Google Drive.
- Round workbooks: `15 NOV - 15 DEC`, `15 DEC - 15 JAN`,
  `15 JAN - 15 FEB`, and `EXIT POLL`.
- Select the constituency by official number (001–117), then select PRE1,
  PRE2, PRE3 or EXIT. Never combine waves into a single polling result.
- Treat blank dashboards as zero observations, never as estimated results.
- In the Master Dashboard, use `Constituency_Detail` to select the Assembly
  constituency number and `Round_Comparison` to compare PRE1, PRE2 and PRE3.
- In a monthly workbook, use `Constituency_Mini_Dashboard` to select a
  constituency. `Collection status` must remain `DISABLED`.

## Aggregate batch review

1. Open the round workbook's `Aggregate_Approvals` tab.
2. Match the non-identifying `source_batch_id`, round and constituency against
   `Constituency_Summary_117`.
3. Confirm counts are integers, the approved count does not exceed the eligible
   sample, and `valid_response_total` uses `option_id=all`.
4. Record `APPROVED`, `REJECTED`, `PENDING` or `REVOKED`, a genuine reviewer
   label, review time and note. Never fabricate a reviewer.
5. Check the Master `Sync_Audit` tab and `Sync_Status` after an authorized run.
   EXIT remains isolated and unpublished.

## Daily monitoring

- Review `Daily_Trend`, synchronization freshness and failed-job alerts.
- Treat `synthetic_sync_probe` and `SYNTHETIC-*` batches as diagnostics only.
- If a run fails, leave collection disabled, preserve the execution record and
  investigate before retrying. Deterministic keys make retries safe.

## Candidate review

1. Open the source-review queue.
2. Open the HTTPS evidence link and confirm constituency, name, party/status,
   publication date and source type.
3. Accept or reject the draft as a named human reviewer.
4. An accepted draft remains approved, not automatically published.
5. Only ECI evidence can support `officially_contesting` status.

## Data-quality response

- Investigate invalid constituency codes, cross-round records, duplicate batch
  IDs, count/sample mismatches and stale sync timestamps.
- Do not copy individual political responses into messages, public tabs or the
  master dashboard.
- Political aggregates below the approved privacy threshold must stay
  suppressed.

## Backup and emergency shutdown

- Verify the owner-controlled backup folder is private before relying on it.
- Test restoration into a quarantined, Restricted copy; never overwrite the
  source during a drill.
- For an incident, stop the private intake service first, disable scheduled
  synchronization, preserve audit evidence and notify the responsible owner.
- In Apps Script, run `disableAggregateSynchronization` to set the private sync
  flag to false and remove this project's hourly trigger.
- Restore the verified Git bundle only into a new quarantined folder, verify its
  SHA-256 first and never overwrite an active worktree.
- Changing a spreadsheet status cannot by itself authorize collection.

## Account protection and authorization

- Use the owner Google account with MFA. Do not approve unexpected OAuth scopes
  or use shared devices without a locked profile.
- In Apps Script Project settings, keep all spreadsheet IDs in Script
  Properties. Never paste them into source code or browser JavaScript.
- `PANJAB117_SYNC_ENABLED=false` is the default and emergency state.
- Hourly aggregate synchronization needs a separate technical approval after a
  successful dry run. Genuine survey collection requires its own later release
  decision and all operational approvals.

## Current links and approvals

Raw Google Sheet URLs are intentionally omitted from this handover to reduce
accidental forwarding. Find the five named files in the owner's Drive. All five
operational approvals, final collection approval, confidential storage, EXIT
publication, external AI and live collection remain false.

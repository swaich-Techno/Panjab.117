# PANJAB 117 mobile survey operations

Status: collection disabled; synthetic administration only.

## Secure access

- Use the owner Google account with MFA and a screen lock.
- Do not forward spreadsheet links or use a shared browser profile.
- Confirm General access says **Restricted** before entering any approved data.
- The current originals have not yet passed that check. Do not enter real
  responses.

## Daily navigation

- Master Dashboard: open the private `Dashboard` file in Google Drive.
- Round workbooks: `15 NOV - 15 DEC`, `15 DEC - 15 JAN`,
  `15 JAN - 15 FEB`, and `EXIT POLL`.
- Select the constituency by official number (001–117), then select PRE1,
  PRE2, PRE3 or EXIT. Never combine waves into a single polling result.
- Treat blank dashboards as zero observations, never as estimated results.

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
- Changing a spreadsheet status cannot by itself authorize collection.

## Current links and approvals

Raw Google Sheet URLs are intentionally omitted from this handover to reduce
accidental forwarding. Find the five named files in the owner's Drive. All five
operational approvals, final collection approval, confidential storage, EXIT
publication, external AI and live collection remain false.

# Google Sheets administration foundation

Status: synthetic-only local implementation; not deployed.

## Security gate

On 10 November 2026, Drive permission metadata showed all five requested
original spreadsheets had an `anyone` / `writer` permission. The authenticated
browser session belonged to a non-owner account and would lose its only access
if it removed that permission. Therefore, the originals were not changed and
real-data ingestion remains disabled.

Five owner-controlled backup copies were created in the private folder
`PANJAB 117 Secure Sheet Backups — 2026-11-10`. Drive metadata subsequently
showed `shared: false` and only the owner permission on every backup.

Before any workbook setup or collection:

1. sign in as the owner, `b.socio.agency@gmail.com`, through Google's normal
   account interface;
2. set every original spreadsheet's General access to Restricted;
3. add only named administrators with the minimum necessary role;
4. confirm MFA directly in the owner account (not verifiable from this code);
5. re-read Drive permission metadata and preserve the evidence; and
6. keep all collection and launch controls false until the remaining privacy,
   consent, recovery, operations and security approvals pass.

## Implemented local contracts

- `round-registry.ts` creates PRE1, PRE2, PRE3 and EXIT definitions plus all
  468 deterministic constituency-round instances.
- `reporting-contract.ts` defines the aggregate-only workbook tabs, routing
  fields, summary schema, idempotent batch merge and conservative suppression
  of small political-opinion cells.
- `automation/google-sheets/Code.gs` is an undeployed Apps Script template. It
  creates only non-confidential administration tabs and synchronizes only
  approved aggregate rows. It contains no web endpoint, secret or response
  collector. Private workbook IDs must be supplied through owner-controlled
  Apps Script properties and are not committed to Git.
- `candidate-intelligence.ts` provides a deterministic manual review queue.
  External AI and automatic publication remain disabled.

`Responses_Private` is intentionally excluded from default provisioning. The
master dashboard must never receive individual response rows. PRE1, PRE2, PRE3
and EXIT remain wave-separated. EXIT has no assumed date and remains disabled.

## Workbook and dashboard status

No original workbook was modified because the permission gate failed. The
working code can be reviewed and tested safely, but it must not be installed or
triggered until the originals are Restricted. Dashboard charts, selectors and
formulas therefore remain an exact production blocker rather than a claimed
completion.

The proposed political-cell threshold is 50 eligible and 50 approved records.
It is a conservative engineering default, not an approved methodology decision;
methodology and privacy reviewers must approve or replace it before reporting.

## Apps Script operational limits

The template uses a script lock and idempotency key and performs batch reads and
writes. A production owner must still measure actual execution duration, daily
quotas, trigger reliability and observed synchronization delay. No real-time or
5–15 minute service level is claimed.

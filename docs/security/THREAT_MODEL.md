# STRIDE threat model

Status: Step 2A design assessment. Reassess before each data-collection release and after material architecture changes.

## Scope and assets

In scope: browser, Cloudflare edge, OCI application runtime, private MySQL service, Vault, backups, administrator access, CI/dependencies, publication workflow, and security/audit logs.

Highest-value assets are optional identity data, political opinions, consent evidence, response linkage, decryption keys, administrator sessions, publication integrity, backups, and the ability to delete or export records. Public research availability matters, but confidentiality and respondent safety take priority.

Risk scale combines likelihood and impact: Critical, High, Medium, Low. Residual ratings assume all stated controls are implemented and tested; today, survey collection is disabled and the controls are only proposed.

## Threat register

| ID / STRIDE                  | Threat and likely path                                                                      | Inherent risk | Required mitigations                                                                                                                                                                                           | Residual risk |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| T1 / Tampering, Elevation    | SQL injection through survey, search, admin, sort, or report parameters                     | Critical      | Parameterized queries only; constrained query builders; no dynamic identifiers from users; least-privilege DB users; schema validation; negative security tests; WAF as secondary control                      | Medium        |
| T2 / Spoofing                | Credential theft through phishing, token leakage, or reused passwords                       | Critical      | External IdP; WebAuthn/FIDO2-preferred MFA; short sessions; secure/HttpOnly/SameSite cookies; token rotation and revocation; no tokens in URL/logs; user-visible session management                            | Medium        |
| T3 / Spoofing, Elevation     | Administrator account compromise enables export, publication, key use, or deletion          | Critical      | MFA; device/session risk controls; role/time-bound access; two-person approval for export/deletion/key actions; reauthentication; break-glass isolation; real-time alerts                                      | High          |
| T4 / Information disclosure  | Unauthorized bulk survey export through API, SQL client, backup, or report job              | Critical      | No general export permission; server-side row/field authorization; separate processor role; approved de-identification jobs; download watermark/case ID; rate/volume alarms; immutable audit                   | Medium        |
| T5 / Repudiation, Disclosure | Insider searches or correlates respondents outside purpose                                  | Critical      | Named accounts; purpose-specific roles; just-in-time access; query/export audit; separation of duties; privacy training and sanctions; periodic access review; minimize identity linkage                       | High          |
| T6 / Elevation               | Broken RBAC/scope check lets one role or tenant view another scope                          | Critical      | Deny by default; centralized authorization; object/scope checks on every server action; no client-only guards; authorization matrix tests; avoid multi-tenancy until formally designed                         | Medium        |
| T7 / Disclosure              | Database exposed to Internet through public IP, permissive NSG, or tunnel                   | Critical      | Private endpoint only; NSG allows 3306 solely from app/backup NSGs; no public route; external port scans; continuous config checks                                                                             | Low           |
| T8 / Disclosure, Tampering   | Vault key, wrapped-key permission, or application memory compromised                        | Critical      | Envelope encryption; resource principals; separate key admins/users; non-exportable KEK; constrained decrypt policy; rotation; memory/telemetry hygiene; emergency containment and rewrap                      | High          |
| T9 / Tampering, DoS          | Ransomware or destructive SQL drops/encrypts live data and backups                          | Critical      | Separate DB and backup identities; no DDL for runtime; immutable/versioned backup controls where supported; MFA; independent copies; destructive-action approvals; restoration drills                          | Medium        |
| T10 / Disclosure, DoS        | Backup stolen, corrupted, incomplete, or never restorable                                   | Critical      | Client-side envelope encryption with backup-specific key; Object Storage IAM separation; manifests/digests; retention; automated verification; isolated quarterly restore tests; track RPO/RTO evidence        | Medium        |
| T11 / Disclosure             | Cloudflare or browser cache serves a private/admin/survey response to another user          | Critical      | Sensitive-path bypass first; `private, no-store`; no cache-everything; vary and cookie review; two-user cache tests; Cloudflare Trace; origin tests                                                            | Low           |
| T12 / Disclosure             | Answers, tokens, identity, URLs, or keys enter application/edge/DB/CI logs                  | Critical      | Structured allowlist logging; payload/header redaction; opaque IDs; truncated/keyed network digests; short retention; log sink access controls; canary tests; incident deletion process                        | Medium        |
| T13 / Tampering, Elevation   | Malicious/compromised npm package, GitHub Action, build runner, or update                   | High          | Lockfile and `npm ci`; minimal dependencies; pin Actions to immutable commit SHA before production; review Dependabot alerts; provenance/SBOM; protected branch and reviews; no secrets in pull-request builds | Medium        |
| T14 / Tampering              | Unauthorized publication, silent correction, or fabricated citation                         | High          | Immutable versions; source digest; two-person publication approval; public correction history; signed/audited decisions; separate author and approver roles                                                    | Low           |
| T15 / Spoofing, Tampering    | CSRF/replay submits or changes survey/admin state                                           | High          | SameSite cookies; origin validation; CSRF tokens for cookie-authenticated mutations; idempotency keys; nonce/expiry for signed actions; reauthentication for high-risk operations                              | Low           |
| T16 / DoS                    | Bot flood exhausts application, DB connections, free-tier limits, storage, or WAF allowance | High          | Edge and application rate limits; bounded payloads/timeouts; DB pool limits; queues/backpressure where approved; storage alerts; fail-closed collection switch; static public fallback                         | Medium        |
| T17 / Disclosure             | Traffic analysis, raw IP retention, or identity-response joins re-identify participants     | Critical      | Do not store raw IP/fingerprint; detach optional identity; coarsen security telemetry; suppress small cohorts; purpose-limited joins; output disclosure review                                                 | Medium        |
| T18 / Disclosure, Tampering  | TLS downgrade/MITM between application and MySQL                                            | High          | Account `REQUIRE SSL`; client requires CA and hostname identity verification; fail closed; pin approved CA distribution; automated negative tests; monitor cipher/version                                      | Low           |
| T19 / Repudiation            | Attacker or privileged DBA edits local audit rows                                           | High          | Append-only writer; hash chain; frequent export to separately controlled storage/log service; alert on gaps; clock integrity; restrict/monitor DBA actions                                                     | Medium        |
| T20 / Disclosure             | De-identified research output leaks individuals through small cells or linked attributes    | Critical      | Minimum cell thresholds; aggregation; disclosure review; deny raw-answer exports; documented anonymization model; consider formal privacy techniques for high-risk releases                                    | Medium        |

## Abuse cases and security requirements

- A public request must never cause a confidential query using a public-reader connection.
- An ingestion account can add a valid encrypted submission but cannot list, decrypt, export, update, or delete previous submissions.
- A publisher cannot read responses; a survey analyst cannot publish content; a key administrator cannot approve their own data export.
- Cloudflare, Vercel (if retained for static content), and CI must never possess MySQL credentials or plaintext response keys.
- A compromised database or backup yields authenticated ciphertext for selected sensitive fields, not plaintext.
- On identity-provider, Vault, or audit failure, high-risk operations fail closed. Public reading may degrade independently.
- No individual-level report is released; aggregation applies minimum-cell and linkage review.

## Validation plan

Step 2B must turn mitigations into traceable tests: SAST/dependency audit; SQL injection corpus; object-level authorization matrix; two-user cache poisoning test; external port scan; TLS failure tests; key-policy denial tests; logging canaries; bulk-export/insider simulations; backup corruption and isolated restore; destructive-credential test; and tabletop exercises for administrator compromise, ransomware, and respondent deletion.

Step 2B completed local synthetic tests for composite database authorization boundaries, cross-role denials, envelope tampering, key-purpose/owner separation, nonce uniqueness sampling, KEK rotation/recovery, schema constraints, transaction rollback, immutable versions, independently encrypted backup corruption, restore, and deletion-ledger replay. Cloud/network/TLS, cache, real IdP, OCI IAM/Vault, dependency provenance, load, logging pipeline, and tabletop exercises remain open because no infrastructure was provisioned.

Step 4A adds the focused survey-intake analysis in
[`STEP_4A_INTAKE_THREAT_MODEL.md`](STEP_4A_INTAKE_THREAT_MODEL.md), including
consent manipulation, keyed duplicate signals, atomic concurrency, withdrawal,
complementary statistical suppression and the blockers that keep production
intake disabled.

Step 4B adds strict versioned input validation, signed CSRF proof semantics, a
single atomic rate/idempotency/duplicate/response transaction, one-time
withdrawal-code lifecycle controls and publication-level suppression. The
production boundaries and residual blockers are recorded in
[`STEP_4B_INTAKE_READINESS.md`](STEP_4B_INTAKE_READINESS.md).

## Accepted limitations

Free-tier single-node failure, no PITR, no SLA, and capacity uncertainty remain High availability/recovery risks. They cannot be reduced by application code. Confidential production collection requires an explicit owner-signed risk acceptance or migration to paid HA, longer backups/PITR, monitoring, and support.

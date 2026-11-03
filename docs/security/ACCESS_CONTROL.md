# Access control and operational security

Status: proposed production control model with locally validated MySQL roles. No production accounts or authentication exist.

## Authorization rules

- Authentication establishes identity; every server action separately authorizes action, object, scope, and purpose.
- Deny by default. UI visibility is never an authorization control.
- Server Components, Route Handlers, Server Actions, background jobs, and direct operational tools use the same centralized policy vocabulary.
- Never accept role, constituency scope, publication state, price, consent, or owner from an unsigned client claim.
- Reauthenticate and require a second approver for exports, bulk deletion, key lifecycle, role grants, and publication of sensitive material.
- Roles are time-bound where practical and reviewed at least quarterly and on every staff change.

## Human role matrix

| Role                 | Allowed                                                                          | Explicitly denied                                           |
| -------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Research author      | create draft research/content and citations                                      | publish own work; read survey responses; manage roles/keys  |
| Research reviewer    | verify sources, request corrections, approve editorial stage                     | alter source history; access respondent identity            |
| Publisher            | publish fully approved versions                                                  | read responses; administer identities/keys                  |
| Survey designer      | create draft definitions/questions/notices                                       | activate without approvals; read submitted answers          |
| Survey analyst       | access approved de-identified datasets and aggregate outputs                     | optional identity; raw exports; publication/admin functions |
| Privacy officer      | approve purpose/retention, handle rights requests, authorize exceptional linkage | key administration; routine content publishing              |
| Security officer     | investigate redacted events, suspend sessions, approve emergency controls        | routine plaintext response access                           |
| Backup operator      | run/verify encrypted backups and isolated restores                               | application key use; survey analytics; production writes    |
| Key administrator    | manage Vault key lifecycle with dual control                                     | query database content; approve own deletion/rotation       |
| Access administrator | invite/disable identities and assign approved roles                              | grant themselves privileged roles; read survey data         |
| Auditor              | read redacted audit/approval evidence                                            | mutate records, decrypt answers, operate backups            |

No role alone can both decrypt/export raw confidential data and approve that action.

## Workload identities and MySQL grants

| Account            | Minimum privileges                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `public_reader`    | `SELECT` on approved published views in `panjab_public` only                                                                         |
| `content_author`   | execute reviewed draft/version procedures; no direct publish, security, or confidential access                                       |
| `publisher`        | execute approval-gated publish procedure; no confidential schema access                                                              |
| `survey_ingest`    | execute one submission procedure/transaction or narrowly scoped `INSERT`; no list/export/update/delete; no identity join             |
| `survey_processor` | read required encrypted response rows and approved definition metadata; no identity unless purpose-specific job identity is approved |
| `privacy_worker`   | execute deletion/rights procedures with case ID and approval; no broad interactive export                                            |
| `audit_writer`     | `INSERT` into audit events only; no update/delete/select of sensitive metadata                                                       |
| `backup_reader`    | consistent logical-backup privileges only; no DDL/DML; restricted to private backup runner                                           |
| `migration_owner`  | schema changes only during approved maintenance; never a runtime credential                                                          |

Every account is environment-specific, host/NSG-restricted, uses verified TLS and `REQUIRE SSL`, has no `GRANT OPTION`, and receives no global wildcard privilege. Root/admin credentials are break-glass only, stored in Vault, rotated after use, and monitored.

Exact role statements are in `docs/design/mysql-grants.sql`. The disposable MySQL test proved that the public role cannot read confidential tables, the ingestion role cannot list encrypted answers, and the backup role can read but cannot delete responses. Production login accounts remain separate: create them with environment-specific host restrictions and `REQUIRE SSL`, assign exactly one workload role by default, and review `SHOW GRANTS` before release.

## Administrator authentication

- Use an approved external IdP; do not create fake authentication.
- Require MFA for all administrators and prefer WebAuthn/FIDO2 security keys or platform passkeys. SMS is not sufficient for high privilege.
- Require verified email/domain enrollment, named accounts, no shared users, and recovery with identity proof plus two-person authorization.
- Sessions use server-side revocation, secure/HttpOnly/SameSite cookies, short idle/absolute expiry, rotation after privilege change, and CSRF defense.
- High-risk actions require recent MFA and a reason/case ID.
- Joiner/mover/leaver automation disables access promptly; dormant and expired assignments are automatically rejected.

## OCI IAM and network access

- Separate compartments for application, security keys, and backups where policy allows.
- Use groups for humans and dynamic groups/resource principals for workloads.
- Application principal may use only named keys/secrets and required Object Storage prefixes; it cannot manage IAM or keys.
- Bastion sessions are time-limited and audited. No persistent public SSH, database GUI tunnel, or developer IP allowlist to port 3306.
- NSGs permit MySQL only from application/backup NSGs; application ingress only from the approved origin tier; egress is allowlisted.

## Export and privileged access workflow

1. Request includes purpose, fields, population, minimization, expiry, and legal/privacy basis.
2. Privacy officer and a separate data owner approve.
3. A dedicated short-lived job identity creates an aggregate/de-identified output; it does not grant interactive raw SQL.
4. Disclosure controls suppress small cells and risky linkage.
5. Output is encrypted for a named recipient, expires, and is logged by digest—not content.
6. Recipient confirms deletion/retention obligations. Exceptional raw access requires incident-level authorization.

## Audit policy

Log authentication outcome, session/role changes, access denials, survey lifecycle, publication decisions, rights/deletion workflows, export metadata, backup/restore, key operations, and schema changes. Record opaque target IDs, outcome, actor, time, request ID, and reason.

Never log answer/identity plaintext, passwords, tokens, cookies, full request/response bodies, SQL parameters containing sensitive values, encryption keys, wrapped-key blobs, consent free text, or full IP/user-agent by default. Apply field allowlists and automated log-canary tests.

The application audit table is append-only to its writer and hash-chained. At a fixed event/time boundary, a checkpoint records the range, event count, terminal hash, and a keyed anchor digest. The checkpoint document is written through a separate identity to an external append-protected destination; MySQL stores only the destination and receipt digest. Verification recomputes the event chain, keyed anchor, external receipt, range continuity, and absence of checkpoint gaps. A checkpoint stored only in MySQL is not an anchor. Hash chaining detects but cannot prevent deletion by a fully privileged DBA; independent anchor custody and alerts are required.

The Step 2B fake anchor uses an in-memory HMAC key and proves tamper detection only. Production must use a separate Vault key/principal and separately controlled storage or transparency service.

## Abuse prevention

- Rate-limit per route, coarse network signal, session, and survey with privacy-preserving keys.
- Bound body size, field length, nesting, answer count, and processing time before DB access.
- Use idempotency keys for submission and one-time/recent-auth tokens for privileged actions.
- Add DB connection-pool caps, query timeouts, storage thresholds, and a fail-closed collection switch.
- CAPTCHA/challenge is a risk-based fallback only; assess accessibility and privacy before use.

## Review cadence

Review privileged identities monthly during active collection, all roles quarterly, service credentials/key policies on each deployment change, and emergency access immediately after use. Alert on new admins, role grants, repeated denials, unusual record counts, export-like reads, key decrypt spikes, audit gaps, and origin/DB network changes.

## Sources verified 2026-11-03

- [Oracle MySQL IAM policies](https://docs.oracle.com/en-us/iaas/mysql-database/doc/iam-policies.html)
- [Oracle resource principals](https://docs.oracle.com/en-us/iaas/mysql-database/doc/resource-principals.html)
- [Oracle MySQL resource types](https://docs.oracle.com/en-us/iaas/mysql-database/doc/resource-types.html)
- [Oracle MySQL networking](https://docs.oracle.com/en-us/iaas/mysql-database/doc/overview-networking.html)

# Step 5A secure intake architecture decision

**Status:** Development design only; live collection is not approved

**Base commit:** `958c4b37a958dafbf7a83324ed350a49d3cf02ad`

**Decision date:** 4 November 2026

## Decision

Use a dedicated, private intake service and a managed MySQL 8.4 database in a
legally approved region for any future production survey. Keep the Cloudflare
Pages site static and isolated. A future browser form would call the intake
service only after all launch gates pass. The database must use private
networking, TLS, point-in-time recovery, tested encrypted backups and an
approved key-management service.

This repository implements only a provider-neutral service contract, an
in-memory synthetic adapter and draft MySQL migrations. It creates no route,
Worker, database, credential or deployment.

## Options evaluated

| Option                                            | Useful properties                                                                                                                                                                                                               | Material limitations                                                                                                                                                                                                                                                                               | Step 5A decision                                                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Cloudflare Workers + D1                           | Low-friction integration; prepared statements; transactional `batch()`; provider-managed AES-256-GCM at rest and TLS; Free limits of 100,000 Worker requests/day, 5 million D1 rows read/day, 100,000 rows written/day and 5 GB | APAC placement is a non-guaranteed hint; jurisdiction restrictions documented for EU/US/FedRAMP, not India; encryption keys are Cloudflare-managed; Free Time Travel is seven days; D1's binding model does not provide the same table-level database-role separation as the proposed MySQL design | Suitable for synthetic experiments only until residency, legal, recovery and separation-of-duty reviews approve it |
| Cloudflare Worker gateway + private managed MySQL | Edge validation/rate controls plus mature transactions, constraints, database roles, TLS and provider-selected backup/PITR                                                                                                      | Two providers and network paths increase operational complexity; secure private connectivity and managed KMS/PITR are unlikely to be zero-cost                                                                                                                                                     | Viable production shape after vendor, region, cost and operations approval                                         |
| Private intake service + managed MySQL            | Clearest trust boundary; mature transactions, constraints and least-privilege roles; can select an approved region and recovery tier                                                                                            | Requires an approved hosting budget, patching/monitoring ownership and a separate protected service                                                                                                                                                                                                | **Recommended production target**                                                                                  |
| Oracle MySQL HeatWave Always Free                 | 50 GiB data/log storage and 50 GiB backup allowance can support a development proof of concept                                                                                                                                  | No high availability, read replica, manual backup, PITR, SLA or Oracle Support; automatic backup retention is one day                                                                                                                                                                              | Development-only; not accepted as the sole confidential production store                                           |

No free tier is represented as sufficient for confidential political-opinion
collection. Final cost depends on approved region, traffic, backup retention,
KMS, monitoring, egress and support. Obtain a written provider quote before
production approval.

Primary references:

- [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Cloudflare D1 data location](https://developers.cloudflare.com/d1/configuration/data-location/)
- [Cloudflare D1 data security](https://developers.cloudflare.com/d1/reference/data-security/)
- [Cloudflare D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
- [Cloudflare D1 batch transaction behavior](https://developers.cloudflare.com/d1/observability/find-expensive-queries/)
- [Oracle MySQL HeatWave Always Free restrictions](https://docs.oracle.com/en-us/iaas/mysql-database/doc/features-mysql-heatwave-service.html)
- [MySQL 8.4 transaction statements](https://dev.mysql.com/doc/refman/8.4/en/commit.html)
- [MySQL 8.4 backup and recovery](https://dev.mysql.com/doc/refman/8.4/en/backup-and-recovery.html)

## Proposed trust boundaries

```text
static Pages site (public, no data)
        |
        | future HTTPS, exact Origin, CSRF proof, strict JSON
        v
dedicated intake service (private configuration, no answer logging)
        |
        | TLS + least-privilege ingestion identity
        v
operational headers | civic ciphertext | political ciphertext
        |                    |                    |
        +------------ separate wrapped keys ------+
                             |
                       approved KMS/HSM
```

The public site receives no database identity. Analysts receive only approved,
disclosure-controlled datasets. Raw civic and political review are different
MFA-protected roles. Export authorization and export execution are different
roles.

## Threat model

| Threat                           | Control in this design                                        | Remaining production gate                          |
| -------------------------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| Malformed or oversized input     | Strict keys, types, options and 32 KiB body limit             | Edge and application integration test              |
| Stale questionnaire/consent      | Pinned version and SHA-256 digest                             | Human approval and immutable registry publication  |
| Cross-site request/CSRF          | Exact origin plus signed, expiring double-submit proof        | Production secret/KMS and cookie policy            |
| Replay and concurrent duplicates | Keyed signals and atomic transaction boundary                 | Durable adapter and load/concurrency test          |
| Abuse/rate exhaustion            | Keyed privacy-scope bucket; no raw IP in response rows        | Proxy-derived signals, retention and appeal policy |
| False duplicate certainty        | Identical answers go to review and are not deleted            | Reviewer SOP and quality audit                     |
| Database compromise              | Civic/political application-level envelopes and distinct KEKs | Managed KMS, rotation and incident exercise        |
| Insider/raw-data misuse          | MFA, purpose, approval ID, RBAC, answer-free audit            | Identity provider and dual-control export workflow |
| Log or error disclosure          | Stable public errors and metadata-only audit events           | Provider log redaction verification                |
| Withdrawal re-identification     | Random receipt, keyed digest, limited attempts, one use       | Approved expiry/contact/appeal policy              |
| Backup resurrection              | Deletion ledger and restore-time suppression                  | Tested backup processor and legal retention ruling |
| Statistical disclosure           | Small-cell and complementary suppression                      | Independent statistical disclosure review          |

## Consequences

- The existing static preview and all 117 constituency records remain
  unchanged.
- The 5 November target does not alter any gate.
- The local adapter proves behavior, not durability or production readiness.
- A future implementation must be a separately reviewed service; adding a
  Next.js route to the static Pages project is not approved by this decision.

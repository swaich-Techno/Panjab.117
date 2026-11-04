# Step 5A security test plan

## Automated local coverage

| Area                                   | Evidence                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------- |
| Malformed, oversized and unknown input | Strict validator and 32 KiB body limit tests                               |
| Consent/version/segment enforcement    | Existing intake tests plus stale version and invalid segment service tests |
| Political-consent isolation            | Validator and separate encrypted-partition tests                           |
| Cross-origin and CSRF                  | Exact-origin and forged-signature tests                                    |
| Replay and concurrency                 | Twelve concurrent attempts produce one accepted record                     |
| Duplicate handling                     | Identical answer sets are retained for human review, not deleted           |
| Transaction rollback                   | Injected commit failure leaves no response or claims                       |
| Rate abuse                             | Bounded keyed scope rejects without storing an extra response              |
| Unauthorized raw access                | MFA, purpose, approval and civic/political RBAC tests                      |
| Key rotation                           | Old wrapped data key remains decryptable during synthetic rotation         |
| Withdrawal reuse                       | Redeemed receipt cannot be reused; payload access is denied                |
| Backup deletion                        | Civic and political suppression ledger actions are emitted                 |
| Small-cell/differencing                | Existing primary and complementary suppression tests                       |
| Logging                                | Audit event contains metadata only, no answers                             |

Run the focused suite with `npm run test:security:intake`. The optional MySQL
integration suite requires an explicitly configured disposable local test
database; Step 5A neither provisions nor connects to one.

## Required before live collection

- Fuzz/property tests and an independent penetration test.
- Real durable-adapter tests against the approved MySQL version, including
  deadlocks, unique-claim races, rollback and connection loss.
- Provider ingress, WAF/rate-limit, CSRF cookie, CORS and request-size tests.
- KMS unavailable/rotation/disable/delete exercises.
- MFA, offboarding, dual-control export and audit-alert tests.
- Encrypted backup restore with deletion-ledger suppression and measured RPO/RTO.
- Log/trace/exception sampling proving no answer or receipt disclosure.
- Statistical disclosure and differencing review across overlapping releases.
- Accessibility and multilingual comprehension testing of final consent and
  withdrawal journeys.

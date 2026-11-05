# Step 5E end-to-end verification

Date: 5 November 2026

Scope: local and synthetic only

## Automated workflow evidence

`npm run test:step5e` executes 14 tests across four files. The focused run passed after implementation.

| Required behavior                            | Evidence                                                                                                                                                                                     |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| English/Punjabi/Hindi and nine-segment input | Browser harness exposes all three locale codes and segments 54, 55, 56, 57, 58, 59, 67, 69 and 106; validation uses the existing multilingual questionnaire contracts.                       |
| Age and civic consent                        | Missing or wrong values fail validation; production age policy remains unapproved.                                                                                                           |
| Separate political consent                   | Political answers require the separate Boolean consent and encrypt under the political key purpose.                                                                                          |
| CSRF bootstrap and HTTPS submission          | Loopback harness uses a Secure/HttpOnly/SameSite cookie plus header; application tests cover signed proof, expiry, forgery, origin, Fetch Metadata and HTTP rejection.                       |
| Encryption and atomic storage                | Civic and political ciphertext/key purposes are checked; plaintext answer field names do not appear in stored records. Existing MySQL adapter tests verify atomic claims and transactions.   |
| Receipt and retry                            | Initial acceptance returns an opaque response ID and 256-bit withdrawal secret; same-secret replay recovers it and a changed secret receives neither value.                                  |
| Durable audit/outbox                         | Commit enqueues an answer-free event; worker restart does not redeliver an acknowledged event. Existing Step 5D tests cover crash-after-delivery idempotency, retries and dead-letter state. |
| Withdrawal                                   | Correct receipt proof destroys live civic/political payloads and records deletion-ledger actions.                                                                                            |
| Encrypted backup and restore                 | Authenticated backup is restored to quarantine; the later deletion ledger suppresses the withdrawn record and release remains false.                                                         |
| Dependency failure                           | Database, secret, answer-key and emergency-stop failures return a generic unavailable response and do not store a response.                                                                  |
| Concurrent submission                        | Five simultaneous synthetic submissions produce five unique response IDs and five outbox entries.                                                                                            |
| Administrator denial                         | The survey analyst role cannot read raw civic answers even with authentication/MFA-shaped context.                                                                                           |
| Privacy-safe logs                            | Transport audit records contain classification, time and correlation only; test scans reject question and secret field names.                                                                |
| Public-site separation                       | Static source contains no Step 5E route or local intake endpoint; browser storage APIs and external URLs are absent from the staging page.                                                   |

## Focused result

- Test files: 4 passed.
- Tests: 14 passed.
- Lint: passed with zero warnings after corrections.
- TypeScript strict check: passed after corrections.

## Execution evidence boundary

The complete regression, fresh disposable MySQL 8.4.13 run, Cloudflare static build and BrowserAct evidence are recorded in `STEP_5E_VERIFICATION.md`. BrowserAct's local HTTPS check remains blocked by its managed browser rejecting the temporary self-signed certificate; this limitation is not converted into a pass. A test result is not a production approval.

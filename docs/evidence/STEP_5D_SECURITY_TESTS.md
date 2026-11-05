# Step 5D security test evidence

Date: 5 November 2026

The focused suite covers hostile replay, lost-receipt recovery, exact outcome classification, audit-sink failure isolation, durable outbox crash/restart and dead-letter behavior, signed approval forgery/revocation/expiry/release binding, bounded screening cleanup and migration safety contracts.

The focused intake suite passed 49/49 tests, Step 5C passed 16/16, and the focused Step 5D suite passed 40/40. The ordinary complete unit run passed 270 tests and skipped the 15 environment-gated MySQL tests. A separate authorized run against disposable MySQL 8.4.13 executed those tests: 15 passed, 0 failed, 0 skipped.

Every fixture is synthetic. Secret scans and diff review must remain clean before any checkpoint is authorized.

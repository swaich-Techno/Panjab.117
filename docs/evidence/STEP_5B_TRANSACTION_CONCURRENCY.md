# Step 5B transaction and concurrency evidence

## Atomic intake boundary

`MysqlSecureIntakeTestAdapter` is test-only. It writes the response header,
civic ciphertext, optional political ciphertext, withdrawal receipt,
idempotency claim, duplicate-screening claims and durable rate claim in one
InnoDB transaction. Ciphertext envelopes and wrapped keys remain partitioned by
civic and political purpose. No plaintext answer is persisted.

The adapter verifies, under the same transaction, that the questionnaire,
notice and synthetic collection approval are enabled, current, mutually bound
and not revoked. The database foreign key independently binds each response to
that exact approval tuple. Political payload insertion additionally requires a
true political-consent value on the parent response.

## Executed cases

- Ten concurrent requests with one idempotency key produced one accepted
  response and nine safe replays.
- Six different requests with identical answers produced one accepted response
  and five `pending_duplicate_review` responses. Screening does not delete or
  reject people automatically.
- Active and retained keyed-screening digests were claimed, exercising a key
  rotation window without storing raw identifiers.
- A normal pre-commit exception and a destroyed connection before commit left
  no response row.
- An exception after a successful commit modeled an uncertain commit; replay
  through the idempotency key returned the committed response and no stranded
  screening claim.
- A real two-connection InnoDB deadlock produced `ER_LOCK_DEADLOCK`; the
  adapter's bounded retry path recovered after one retry.
- A durable rate window returned `rate_limited` without creating a response.

Retries are limited to recognized deadlock, lock-timeout and duplicate-race
conditions. Backoff is bounded. An unknown commit result is never blindly
retried with a new idempotency identity.

## Remaining production gaps

The connection-loss and post-commit cases use deterministic test hooks; they do
not replace proxy-level packet interruption, server crash or failover testing.
The fixed test duplicate/rate windows are not approved retention policy.
Production still requires connection TLS, pool sizing, timeout budgets,
observability without sensitive values, load testing, failover testing and an
incident runbook.

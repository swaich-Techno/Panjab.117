# Step 4B secure intake readiness design

Status: **synthetic architecture only; no submission endpoint or production
store exists**

The public preview and live intake are separate trust boundaries. Nothing in
this document changes `state: "draft"`, `launchApproved: false`, any of the five
operational approvals, or the disabled AI configuration.

## Validated envelope

`src/lib/survey/intake-readiness.ts` rejects unknown fields and validates:

- the exact questionnaire version and consent notice version/digest;
- locale, opaque idempotency key and privacy-scoped rate token;
- proposed 18-or-older self-attestation without date of birth;
- affirmative civic consent and independent political-opinion consent;
- exact question IDs, option IDs, response shapes and the three-choice limit;
- all nine permitted Assembly segments; and
- absence of political answers when political consent is false.

This is an allowlist prototype, not a route handler. Production must also bound
the raw request body before JSON parsing, require `application/json`, normalize
Unicode deliberately, reject duplicate JSON keys at the parser boundary and
return generic client errors without echoing answers.

## CSRF and replay

The synthetic CSRF proof is origin-bound, signed with HMAC-SHA-256, uses matching
cookie/header tokens and expires after a short window. Production requires a
`Secure`, `HttpOnly` where compatible, `SameSite` cookie strategy, exact Origin
validation and key rotation. Anonymous intake must not rely on CORS as CSRF
protection.

Replay protection uses survey-version-scoped HMAC idempotency signals. Key IDs
are stored with signals so an active key and retained rotation key can overlap
for an approved appeal/duplicate window.

## One atomic transaction

The Step 4B in-memory transaction evaluates, in one critical section:

1. durable rate-bucket state across active and retained keys;
2. idempotency replay signals;
3. duplicate payload signals;
4. the opaque response record; and
5. the resulting human-review status.

It builds a copy of state and swaps it only at commit. A failure-injection test
proves that no rate, idempotency, payload or response claim is stranded when the
commit fails. Concurrent replay tests admit one response. A duplicate is stored
for human review, excluded from analysis and never automatically deleted.

Production requires one ACID database transaction with unique constraints and
row/key locking. The response, consent snapshot, idempotency claims, duplicate
signals, rate counter mutation and audit event must commit or roll back together.
The in-memory class proves semantics only; it is not distributed or durable.

## Confidentiality boundaries

- Answers and optional identity data use separate tables, encryption keys and
  access roles.
- Application encryption uses per-record DEKs and managed KEK wrapping; HMAC,
  CSRF, answer encryption, identity encryption and backup keys are separate.
- Raw IP addresses, browser fingerprints, headers, withdrawal codes, answers
  and contact details are prohibited from application/security logs.
- Logs allow only event code, survey version, result class, key ID, truncated
  signal prefix, latency and opaque correlation ID.
- Confidential survey or identity content is prohibited from AI providers.

## Least privilege

| Principal          | Minimum production capability                                   |
| ------------------ | --------------------------------------------------------------- |
| public intake      | execute one validated intake transaction; no read/list          |
| duplicate reviewer | read flagged redacted responses; record review/appeal decision  |
| privacy operator   | locate via verified withdrawal token; execute approved deletion |
| research analyst   | read approved de-identified extract only                        |
| backup operator    | encrypted backup/restore; no plaintext answer access            |
| security auditor   | read allowlisted audit events; no answer payload                |

No role design is an authorization grant until tested against a production-like
database and identity provider.

## Withdrawal, backup and recovery

The consent snapshot now records a digest of the exact localized notice. A
withdrawal code has at least 192 bits of entropy, is shown once, stored only as a
keyed digest, tied to a key ID and lifetime, rate-limited, locked after bounded
failures and redeemed once. Losing an anonymous code can make a response
unlocatable; this must remain in the participant notice.

Deletion must remove or cryptographically erase live answer/identity data,
record the minimal deletion marker, propagate it through derived extracts and
replay the protected deletion ledger after every restore. Live collection stays
blocked until an encrypted restore test demonstrates that a withdrawn record is
not resurrected.

## Abuse monitoring and incident response

Monitor aggregate rejection classes, rate-bucket saturation, transaction
rollback, key errors, consent-version mismatch, restore/deletion failures and
privileged access. Alerts must avoid answer content and high-cardinality raw
identifiers. A runbook must define pause authority, evidence preservation, key
rotation, participant notification assessment, recovery and approval to reopen.

## Residual blockers

- no production API, parser, database transaction or durable rate store;
- no managed KMS/HSM, production IdP, MFA or role enforcement;
- no provider logging inspection, WAF/load test or distributed concurrency test;
- no approved age policy, notice, contact, retention or complaint channel;
- no encrypted production-scale restore/deletion test;
- no independent security, privacy, language, methodology or accessibility
  approval; and
- no authorization to enable collection.

# Step 4A survey-intake threat model

Status: **design and synthetic prototype only; production intake blocked**

Protected assets include consent evidence, answer confidentiality, separation of
optional identity, questionnaire integrity, withdrawal capability, duplicate
review fairness, encryption keys, audit evidence and aggregate outputs.

| Threat                      | Proposed controls                                                                                              | Residual risk / blocker                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| automated submissions       | edge and server quotas, bounded bodies, progressive challenges only after risk, fail-closed intake switch      | no WAF/load evidence; accessibility impact of challenges untested                 |
| duplicate responses         | atomic version-scoped claims, keyed HMAC signals, rate limits, human review and appeal                         | anonymous screening cannot prove one response per person                          |
| consent manipulation        | immutable version IDs/digests, no preselection, separate political consent, signed deployment artefact         | final legal/linguistic review and deployment attestation absent                   |
| unauthorized access         | deny-by-default roles, separate identity/answer keys, object authorization and audited privileged actions      | no production IdP, MFA, session or operational access review                      |
| cross-survey data mixing    | survey-version IDs in database constraints, HMAC domains, authenticated encryption context and reports         | production transaction tests and migrations absent                                |
| reidentification            | no raw IP/fingerprint, identity separation, structured answers, small-cell and complementary suppression       | linkage and longitudinal attacks require disclosure review                        |
| injection attacks           | typed allowlists, bounded validation, parameterised SQL, no dynamic identifiers from request values            | no production API or security corpus test exists                                  |
| CSRF                        | no mutation route now; future SameSite cookies, Origin checks and CSRF token for cookie-authenticated actions  | production session design absent                                                  |
| replay attacks              | atomic idempotency claim scoped to survey version, expiry policy, authenticated request context                | durable transactional store and expiry operation unimplemented                    |
| rate-limit bypass           | privacy-scoped keyed signals, layered edge/app limits, constituency-independent safety budget                  | distributed adversaries remain; raw fingerprinting prohibited by default          |
| confidential logging        | allowlisted event schema, signal prefix only, no answers/tokens/headers, canary tests and short retention      | production providers and log pipeline not selected or tested                      |
| HMAC/key compromise         | separate purpose key, 256-bit minimum, active/retained rotation ring, bounded duplicate window and destruction | no managed KMS, dual control, rotation drill or compromise response               |
| backup recovery             | separate backup key, authenticated manifest, restore ledger and deletion replay                                | production-scale restore, RPO/RTO and provider isolation unproven                 |
| withdrawal/deletion failure | explicit state machine, minimal locator HMAC, privacy approval, live deletion then backup-ledger completion    | no production rights channel, SLA, case system or end-to-end encrypted-store test |

## Stronger duplicate-screening design

`src/lib/survey/duplicate-screening.ts` replaces unkeyed answer hashes with
HMAC-SHA-256 signals. The canonical input uses length-prefixed fields and
separate domains for idempotency, answer duplication and rate limiting.
Survey-version ID and segment number are included where relevant.

`AtomicSignalStore.claimAny` requires an all-or-nothing claim across signals
derived from the active and retained rotation keys. This makes a response
detectable across a bounded key-rotation window and prevents check-then-insert
races. Rate-limited attempts do not reserve idempotency or payload signals, and
replayed idempotency keys do not reserve new payload signals. The in-memory
implementation is a single-process test double only; production requires a
database transaction or atomic script with a unique constraint and concurrency
tests.

Key lifecycle proposal:

1. generate a separate duplicate-screening HMAC key in managed key storage;
2. mark exactly one version active;
3. retain the previous key only for the approved duplicate/appeal window;
4. derive and atomically claim both active and retained signals during overlap;
5. remove old signals and destroy the old key after retention approval; and
6. rotate immediately after suspected compromise, quarantine affected signals
   and require human review instead of deleting responses.

Risk flags are evidence for review, not proof of misconduct. Flagged responses
are never automatically deleted. A reviewer sees the flag code and explanation,
can release or exclude the response under a documented policy, and records an
appealable decision. No browser fingerprinting is used by default.

## Security invariants

- A date or schedule state alone cannot enable intake.
- No production mutation route exists in Step 4A.
- Political-opinion answers require their own affirmative consent.
- Confidential answers never enter AI prompts, logs or duplicate signals in
  plaintext.
- A duplicate flag cannot automatically delete or silently suppress a response.
- Reports exclude confirmed duplicates and keep pending-review counts visible.
- Recovery must replay the deletion ledger before restored data becomes usable.

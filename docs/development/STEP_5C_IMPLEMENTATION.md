# Step 5C fast-track implementation

**Status:** synthetic development only; not approved for production

## Implemented

- A transport-agnostic intake HTTP boundary enforces `POST`, HTTPS, exact
  Origin, same-origin Fetch Metadata, JSON content type, a 32 KiB body ceiling,
  signed double-submit CSRF proof and safe no-store responses.
- Existing strict questionnaire validation rejects unknown fields, stale
  questionnaire/consent versions, forged consent, unsupported constituencies
  and unapproved answer values.
- Existing AES-256-GCM envelope encryption keeps civic and optional political
  answers in distinct purposes and wrapped keys.
- Existing transactional repositories provide idempotency, rate limiting,
  duplicate review, receipt issuance and withdrawal deletion.
- Screening windows now come from a scoped, expiring retention policy. The
  production policy is a draft with no approval; only the explicit synthetic
  policy is usable in tests.
- Production activation requires six evidence records bound to exact content,
  commit and image digests. Environment variables do not satisfy approval.
- The browser form adds draft age confirmation, a complete answer review,
  retry-safe in-memory request tokens, double-submit protection, loading and
  error states, and one-time receipt presentation. The public page supplies no
  endpoint or CSRF bootstrap, so this path is unreachable there.

## Boundaries

`PUBLIC_PREVIEW_ENABLED` is conceptually true and
`LIVE_SURVEY_COLLECTION_ENABLED` is false. The committed authority is
`currentCollectionControls`; it keeps final launch and all five operational
approvals false. AI remains disabled.

No Next.js route handler, Cloudflare Function, Worker, public API, production
database connector, cloud identity, secret or provider resource is added. The
HTTP module is an adapter contract for a separately deployed intake service.

## Constituency and language scope

The server accepts exactly 54, 55, 56, 57, 58, 59, 67, 69 and 106. Tests cover
all nine values in English, Punjabi and Hindi. Translation and age-policy
approval are still blocked on independent review.

## Not implemented or verified

- A production hosting account, WAF, load balancer, runtime or database.
- A real IdP-backed approval-evidence provider and production KMS client.
- A production MySQL connection factory with certificate/hostname validation.
- A production-wide screening-expiry worker.
- A CSRF bootstrap endpoint and secure cookie issuer.
- A durable, transactionally coupled audit/outbox sink. The current audit port
  is testable but does not prove that an accepted response and its audit event
  commit atomically in a production service.
- Recovery of the original one-time withdrawal receipt when a submission is
  accepted but its response is lost. Retrying is idempotent, but the stored
  digest cannot reconstruct the plaintext receipt; launch needs an approved
  recovery protocol that does not weaken receipt secrecy.
- Administrator UI, production withdrawal endpoint or raw-data UI.
- Real browser/assistive-technology testing and external penetration testing.

These are launch blockers, not deferred claims of completion.

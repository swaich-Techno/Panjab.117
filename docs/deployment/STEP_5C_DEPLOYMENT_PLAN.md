# Step 5C staging and production deployment plan

**Status:** plan only; no provider connection or deployment authorized

## Separation

The existing `panjab-117.pages.dev` project remains static, read-only and
non-indexed. It receives no database, KMS or workload identity. A future intake
service uses a separate hostname, project/compartment, private network and
deployment pipeline. The website must not receive that hostname until staging
and all launch gates pass.

The approved public and intake hostnames must be same-site custom subdomains so
Fetch Metadata and a Secure, host-only CSRF cookie can remain restrictive. The
current `pages.dev` hostname is not approved to call an unrelated provider
domain. Custom-domain and DNS work needs separate authorization.

## Proposed staging

- India-region private application runtime behind WAF and TLS load balancer.
- Private managed MySQL 8.4 with synthetic data only.
- Separate non-production KMS keys, secrets, IAM groups, logs and backup bucket.
- Exact production image and infrastructure definition, but smaller capacity
  and no ability to read production secrets or networks.
- Synthetic questionnaire/consent records visibly marked non-production.

## Server-only configuration contract

The future runtime needs the expected HTTPS Origin; deployment commit and image
digests; MySQL private endpoint, CA and secret locator; distinct civic,
political, withdrawal, screening and backup key/secret locators; approval-store
locator; audit destination; retention-policy ID; and backup/PITR targets.

Values must come from workload identity and managed secrets. They must not be
committed, prefixed `NEXT_PUBLIC_`, embedded in images, passed on command lines
or copied into Cloudflare Pages. A Boolean environment variable cannot grant
collection authority: the service also requires six current approval records
bound to the exact release evidence.

## Pipeline

1. Build, test, scan and sign an immutable image; record SBOM and digest.
2. Validate infrastructure and migration plans against policy.
3. Deploy to isolated staging with synthetic data and collection disabled.
4. Run full HTTP, database, backup/restore, accessibility and penetration tests.
5. Obtain and bind all independent review records.
6. Require two-person production change approval; provision only under a
   separately authorized task.
7. Deploy with intake disabled, verify TLS/private connectivity/telemetry, then
   run synthetic smoke tests.
8. Load six approval records. Activation is a separate audited change and must
   open only the approved time window.

## Monitoring and rollback

Alert on public exposure, approval expiry/revocation, key/IAM change, denied
database access, WAF abuse, failure rate, transaction ambiguity, backup/PITR
lag, deletion replay and spend. Logs exclude bodies, answers, receipts, raw IPs,
cookies and authorization data.

Rollback first closes the intake gate and preserves withdrawal service. Revert
the application to the previous signed digest; use forward-only migration
repair or quarantine restore rather than destructive schema rollback. Never
overwrite the current database. A regional restore must replay the immutable
deletion ledger before private promotion.

## Activation blockers

No cloud account, runtime, hostname, TLS certificate, WAF, database, KMS key,
secret, IdP, backup or on-call function exists. Production deployment remains
unapproved.

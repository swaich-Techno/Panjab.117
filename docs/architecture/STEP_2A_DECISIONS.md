# Step 2A architecture decisions

Status: proposed decisions for approval. No infrastructure or application behavior changed.

## Context inspected

The repository is a clean Next.js 16.4.4 / React 19.3.1 App Router application with TypeScript strict mode, Tailwind CSS 4, ESLint, Prettier, Vitest, and no database/authentication dependency. The existing site is informational: it has no survey submission, admin function, privileged API, or production credential. Existing controls include framework strict mode, selected response security headers, secret/build-output ignores, dependency locking, CI checks, and a stated prohibition on collecting data in this phase.

Current gaps are intentional for Step 1 but block confidential data: no identity provider or MFA, no server authorization, no database, no application encryption, no audit trail, no CSP/HSTS policy, no backup restore proof, no privacy workflow, and no abuse protection.

## Decisions

### D1 — Keep confidential processing inside OCI

**Decision:** Place the data-handling Next.js/API runtime on OCI Compute inside the same VCN as the private MySQL endpoint. Cloudflare proxies HTTPS to that origin. Do not connect Vercel Hobby/default Functions directly to MySQL.

**Why:** MySQL HeatWave endpoints are private. Vercel default egress is dynamic; static egress and Secure Compute require paid tiers and do not document an OCI private-peering solution. Publishing MySQL is unacceptable.

**Consequence:** Free Compute capacity and operational burden must be proved. A Vercel-hosted public/static frontend is optional, but it may call only a separately protected OCI HTTPS API and hold no DB credential.

### D2 — Separate public, confidential, and security schemas

**Decision:** Use `panjab_public`, `panjab_confidential`, and `panjab_security`, with different MySQL accounts and grants.

**Why:** Prevent the common public reader/publisher path from becoming a survey export path. Schema separation complements—not replaces—application authorization and encryption.

### D3 — Minimize and detach identity

**Decision:** Anonymous responses are the default. Optional identity is stored in a one-to-one, separately encrypted record with a shorter retention period. Do not collect raw IP, fingerprints, or unnecessary political identifiers.

### D4 — Use application envelope encryption

**Decision:** Encrypt selected answers and identity fields with AES-256-GCM before MySQL; use per-response data-encryption keys wrapped by versioned OCI Vault keys. Store nonce, tag, AAD version, and wrapped-key reference—not keys—in MySQL.

**Why:** Storage encryption does not protect against a compromised DB administrator or exported logical rows.

### D5 — External identity provider with phishing-resistant MFA

**Decision:** Do not build password authentication in this step. Select an identity provider in Step 2B, require MFA for all administrators, prefer WebAuthn/FIDO2, and map stable subjects to server-side RBAC. Argon2id is reserved for any later approved local credential/recovery verifier.

### D6 — Immutable version and approval workflows

**Decision:** Research, constituency content, surveys, notices, citations, and corrections are versioned. Publishing uses explicit approval and separation of duties; published content is superseded, not edited silently.

### D7 — Cloudflare caches public content only

**Decision:** Explicit bypass rules and `no-store` headers protect auth, admin, survey, private API, confidential report, and personalized responses. Cache only versioned static assets and specifically reviewed public material.

### D8 — Independent backups are a launch gate

**Decision:** Oracle's one-day automatic backup is insufficient. Create independently encrypted logical backups in a separated Object Storage location and pass restoration/integrity drills before confidential collection.

### D9 — Free tier is a prototype, not a confidentiality guarantee

**Decision:** Use free resources for design and synthetic-data validation only until availability, capacity, legal, monitoring, recovery, and operational requirements are accepted. No SLA/HA/PITR means the platform must support a visible “collection unavailable” fail-closed state.

## Rejected alternatives

- **Public MySQL with IP/password restrictions:** rejected; Oracle service is private by design and Internet database exposure is unnecessary risk.
- **Cloudflare as private DB connectivity:** rejected; CDN/WAF proxy HTTP(S), not MySQL network trust.
- **One shared DB account:** rejected; makes public-content compromise a confidential-data compromise.
- **Database-only encryption:** rejected; privileged exports can expose plaintext.
- **Encrypting every column:** rejected; creates operational complexity without protecting low-risk public data. Classification determines field encryption.
- **Native one-day backup as recovery plan:** rejected; no manual backup/PITR/restore assurance.
- **Building fake/local admin auth now:** rejected; identity-provider and recovery design require approval.

## Approval gates before implementation

1. Privacy/legal approval for political-opinion processing, consent language, rights handling, residency, and retention.
2. Hosting proof: OCI capacity, private DB TLS identity validation, origin lockdown, and cost guardrails.
3. Cryptography review: field list, AAD, key hierarchy, Vault policy, rotation, and break-glass procedure.
4. Identity/RBAC review: provider, MFA, role matrix, joiner/mover/leaver process.
5. Recovery proof: independently encrypted backup restored into isolation with recorded RPO/RTO.
6. Abuse/privacy test: cache leakage, CSRF, authorization, mass export, logging, and dependency checks.
7. Go/no-go decision on whether free-tier reliability is acceptable; otherwise approve paid HA/backup/support resources.

## Open questions for Step 2B

- Which legal entity is the data fiduciary/controller, and which jurisdiction/data-residency obligations apply?
- Are any identifiable political opinions genuinely necessary? Can aggregation or anonymous collection satisfy the research purpose?
- Which OCI home region and availability domain are approved?
- Is OCI Always Free Compute available and adequate for the Next.js runtime and backup runner?
- Which identity provider and phishing-resistant MFA method will be used?
- What exact response volume, payload distribution, retention, RPO, and RTO are acceptable?
- Is a paid failover/PITR/support budget available before confidential launch?
- Who holds Security Officer, Privacy Officer, Backup Operator, and Publication Approver duties?
- Which observability destination can receive redacted audit/security events without creating a second personal-data store?

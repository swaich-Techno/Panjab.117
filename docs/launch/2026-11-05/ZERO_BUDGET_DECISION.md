# Zero-budget infrastructure decision

Maximum authorized expenditure: **₹0**. No account, trial, billing profile or resource was created.

## Available at ₹0

### Existing Cloudflare Pages Free — suitable only for the public static preview

It already serves static files and supports the required `_headers`/`_redirects`. Free limits include 500 builds per month, one concurrent build, 20,000 files and a 25 MiB per-file limit. The release candidate uses 129 files, the largest 229,288 bytes, and no runtime function. This is suitable for non-confidential, read-only content—not survey response collection.

Official source: [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/).

### Free local/open-source development

Next.js, TypeScript, Vitest, ESLint, Prettier, local Chrome and disposable local MySQL evidence allow continued synthetic engineering at ₹0. Local evidence does not provide a continuously operated production service.

## Free-eligible but not approved for confidential collection

### Cloudflare Workers/D1 Free

D1 is SQLite-based, not MySQL 8.4. Location hints do not guarantee placement and available jurisdiction restrictions do not establish India-only storage. Free quotas, runtime limits and Cloudflare account terms apply. It would require an unapproved architecture/data migration and still would not supply the independently approved production controls.

Official sources: [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [D1 data location](https://developers.cloudflare.com/d1/configuration/data-location/).

### Aiven Free MySQL

The free plan is advertised without a credit card and without a fixed expiry, but the documented MySQL service is single-node with 1 CPU, 1 GiB RAM and 1 GiB disk. It omits VPC/private connectivity, static IPs, service integrations, SLA and standard support; inactive services may be powered down, and free configurations or regions may change. Backups alone do not establish adequate recovery, key custody, monitoring or continuity for political-opinion data.

Official source: [Aiven free plan](https://aiven.io/docs/platform/concepts/free-plan).

### OCI Always Free

Availability and capacity vary by region, free accounts have no SLA/support, and account creation normally requires payment-card verification. No OCI account or resource is authorized. The offering does not make the complete architecture operational at guaranteed ₹0.

Official source: [Oracle Cloud Free Tier FAQ](https://www.oracle.com/cloud/free/faq/).

## Requires external funding or donated, contractually supported infrastructure

- private production compute and MySQL 8.4 with verified TLS;
- reliable India-region/legal assessment and processor agreements;
- managed KMS/HSM with separate civic and political key custody;
- encrypted backups, PITR, quarantine restore and witnessed recovery drills;
- IdP/MFA, audited administrative access and break-glass control;
- monitoring, alert delivery, on-call response and incident support;
- independent legal/privacy, security, methodology, accessibility and language reviews.

A donated university, civil-society or institutional platform may be evaluated, but donation does not waive processor due diligence, security controls, independence, retention limits or release approval.

## Decision

No verified ₹0 production environment currently meets all privacy, security, recovery, continuity and independent-review requirements. Continue synthetic local development and the static public preview; keep confidential survey collection disabled.

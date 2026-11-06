# Zero-budget hosting decision

Decision: static Release A can remain on existing Cloudflare Pages Free;
confidential Release B is **NO-GO at ₹0**.

## Available at ₹0

- Existing Cloudflare Pages static export for public, read-only information.
- Local Node.js, MySQL disposable testing and open-source development tools
  with synthetic data.
- Oracle Cloud advertises an Always Free MySQL system, compute, VCN, Vault,
  logging and limited backup storage. Signup normally requires a credit/debit
  card and the free service has no SLA or support.

## Why the free database is not approved

Oracle Always Free MySQL lacks high availability, manual backups and PITR, has
one-day automatic backup retention, and provides no SLA or support. Oracle also
states idle accounts may be suspended/terminated, capacity is subject to
availability, and card verification can create a temporary authorization hold:
https://www.oracle.com/cloud/free/faq/

Cloudflare D1 Free is SQLite-compatible rather than the reviewed MySQL schema.
Its free database limit is 500 MB with seven-day Time Travel, and free daily
query limits fail closed until reset when exceeded:
https://developers.cloudflare.com/d1/platform/limits/
It would require a new data model, migration, threat review and recovery design.

## Requires external funding or donation with enforceable terms

A production service needs supported private compute, managed MySQL with HA and
PITR, KMS/secrets administration, independent backup storage, monitoring/on-call
coverage, provider/legal review and recurring restore tests. A donated service
is acceptable only if written terms, support, data region, duration and exit
plan meet the same requirements.

## Not suitable for confidential collection

Static Pages, client-side storage, spreadsheets, public forms, local personal
computers and unreviewed free survey services are not production political-
opinion stores.

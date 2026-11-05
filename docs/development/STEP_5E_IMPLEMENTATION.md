# Step 5E implementation

Date: 5 November 2026

Status: local synthetic development only; no production deployment or collection

Budget ceiling: **₹0**

## Outcome

Step 5E adds a production-shaped, fail-closed integration contract and a free local staging system without changing the public Cloudflare Pages application. It does not add a Next.js route, public API, database credential, cloud resource, AI provider or production approval.

Implemented components:

- `production-integration.ts`: contracts for private MySQL 8.4, TLS 1.3, workload identity, external secret references, separated civic/political/backup key domains, transactional outbox, encrypted backup, restore quarantine, deletion-ledger replay and privacy-safe monitoring.
- `operational-readiness.ts`: dependency alerts, an emergency stop and a launch decision that requires flags **and** verified release evidence, independent review, infrastructure evidence and shutdown readiness.
- `local-synthetic-runtime.ts`: in-memory keys/secrets, existing validated intake, encrypted civic/political partitions, durable synthetic outbox, retry receipt recovery, withdrawal, encrypted backup and quarantined restore.
- `serve-step5e-staging.mjs`: loopback-only TLS 1.3 browser harness with no disk persistence. It cannot fall back to HTTP.
- `create-step5e-tls.ps1`: creates a seven-day, local-only self-signed PFX under ignored `work/`, then removes the temporary certificate-store entry.
- Step 5E focused tests for contracts, failure behavior, concurrent submissions, access denial, outbox restart, backup/withdrawal/restore and public-site separation.

## Deliberate boundaries

The standalone browser harness validates the visible consent/intake/receipt/withdrawal interaction and transport controls. The TypeScript staging runtime validates the real application security model. They are separate on purpose: importing the harness into `src/app` would place an intake route in the static Cloudflare artifact. A future funded private service must bind the tested TypeScript ports to managed identity, managed secrets, KMS and private MySQL.

The browser harness stores only a synthetic response ID and withdrawal-code digest in process memory. It never writes survey answers to disk. Stopping the process clears the maps. This is test behavior, not a production durability design.

## Local HTTPS staging

Use a fresh random PFX password in the current PowerShell session:

```powershell
$bytes = New-Object byte[] 32
$random = [Security.Cryptography.RandomNumberGenerator]::Create()
$random.GetBytes($bytes)
$random.Dispose()
$env:STEP5E_TLS_PFX_PASSWORD = [Convert]::ToBase64String($bytes)
./scripts/create-step5e-tls.ps1 -Password $env:STEP5E_TLS_PFX_PASSWORD
$env:STEP5E_TLS_PFX_FILE = "work/step5e-local-staging.pfx"
npm.cmd run staging:step5e
```

Open `https://127.0.0.1:4175/`. The certificate is self-signed and strictly local; remove `work/step5e-local-staging.pfx` after testing. Never reuse this synthetic password or certificate.

## Safety state

- `LIVE_SURVEY_COLLECTION_ENABLED=false` in effect through checked-in controls.
- final launch approval: false.
- production security, privacy, consent, backup/recovery and operations approvals: false.
- AI provider: false.
- external network from the TypeScript local runtime: false.
- browser persistence: false.
- public Cloudflare preview: unchanged and read-only.

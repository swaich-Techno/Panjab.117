# Panjab 117

Panjab 117 is an independent multilingual civic research platform covering all 117 Punjab Legislative Assembly constituencies. The current development branch includes a regional discovery interface and a disabled, synthetic-only survey-readiness proof of concept.

## Current scope

- English, Punjabi and Hindi locale routes
- Responsive, accessible editorial homepage
- Provisional Majha, Malwa, Doaba and Puadh discovery directories, clearly separated from official election boundaries
- Source-attributed Fatehgarh Sahib parliamentary-to-Assembly mapping
- Disabled survey schedule plus a multilingual, in-memory Step 4A questionnaire and consent preview
- Synthetic withdrawal, keyed duplicate-screening and disclosure-control interfaces
- Strict TypeScript, Tailwind CSS, ESLint, Prettier and Vitest
- Automated GitHub quality checks
- Dependency-free static export prepared for a separately approved Cloudflare
  Pages public preview

No survey submissions, authentication, production database access, payments or administrative tools are implemented. Cultural-region assignments require human review and are not presented as official classifications.

The Step 4A questionnaire and consent translations are drafts requiring native
linguistic and legal review. The proposed survey dates do not override any
security, privacy, consent, backup or operational gate.

## Requirements

- Node.js 20.9 or newer (Node.js 22 recommended)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000/en`; `/pa` and `/hi` open Punjabi and Hindi. The
root redirect is a Cloudflare/static-preview rule and is not applied by the
Next.js development server.

To build and inspect the production-equivalent static output:

```bash
npm run build:cloudflare
npm run preview:static
```

Open `http://127.0.0.1:4173`. The local preview reads the generated `out`
directory and applies the committed Cloudflare `_headers` and root redirect.

## Quality commands

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:security:intake
npm run build
```

Copy `.env.example` to `.env.local` only when local configuration becomes necessary. Never commit `.env.local` or place secrets in variables prefixed with `NEXT_PUBLIC_`.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Engineering decisions](docs/DECISIONS.md)
- [Step 4A questionnaire specification](docs/data/STEP_4A_QUESTIONNAIRE_SPECIFICATION.md)
- [Step 4A consent and withdrawal design](docs/security/STEP_4A_CONSENT_WITHDRAWAL.md)
- [Step 4A intake threat model](docs/security/STEP_4A_INTAKE_THREAT_MODEL.md)
- [Step 4A production gaps](docs/architecture/STEP_4A_PRODUCTION_GAPS.md)
- [Step 4B public-preview deployment proposal](docs/architecture/STEP_4B_PUBLIC_PREVIEW_DEPLOYMENT.md)
- [Step 4B synthetic intake readiness](docs/security/STEP_4B_INTAKE_READINESS.md)
- [Public-preview launch gate](docs/checklists/STEP_4B_PUBLIC_PREVIEW_GATE.md)
- [Live-collection launch gate](docs/checklists/STEP_4B_LIVE_COLLECTION_GATE.md)
- [Step 4B verification](docs/evidence/STEP_4B_VERIFICATION.md)
- [Step 4C static-export compatibility](docs/architecture/STEP_4C_STATIC_EXPORT_COMPATIBILITY.md)
- [Cloudflare Pages configuration](docs/deployment/CLOUDFLARE_PAGES.md)
- [Step 4C rollback procedure](docs/deployment/STEP_4C_ROLLBACK.md)
- [Step 4C public-preview release gate](docs/checklists/STEP_4C_PUBLIC_PREVIEW_RELEASE.md)
- [Step 4C browser and accessibility checks](docs/checklists/STEP_4C_BROWSER_ACCESSIBILITY.md)
- [Step 4C verification](docs/evidence/STEP_4C_VERIFICATION.md)
- [Step 5A secure intake architecture](docs/architecture/STEP_5A_ARCHITECTURE_DECISION.md)
- [Step 5A database security](docs/security/STEP_5A_DATABASE_SECURITY.md)
- [Step 5A privacy and consent](docs/security/STEP_5A_PRIVACY_AND_CONSENT.md)
- [Step 5A backup and recovery](docs/security/STEP_5A_BACKUP_RECOVERY.md)
- [Step 5A security tests](docs/security/STEP_5A_SECURITY_TESTS.md)
- [Step 5A live-collection gaps](docs/architecture/STEP_5A_LIVE_COLLECTION_GAPS.md)
- [Step 5A verification](docs/evidence/STEP_5A_VERIFICATION.md)

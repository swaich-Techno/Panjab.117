# Panjab 117

Panjab 117 is an independent civic research platform covering all 117 Punjab Legislative Assembly constituencies. This integration branch prepares an English-only static public preview and a disabled, synthetic-only survey-readiness proof of concept.

## Current scope

- Seven English-only static public routes; historical Punjabi/Hindi work remains in Git history
- Responsive, accessible editorial homepage
- Provisional Majha, Malwa, Doaba and Puadh discovery directories, clearly separated from official election boundaries
- Source-attributed Fatehgarh Sahib parliamentary-to-Assembly mapping
- Disabled survey schedule plus an English, in-memory questionnaire and consent preview
- Synthetic withdrawal, keyed duplicate-screening and disclosure-control interfaces
- Configurable minimum targets of 500 valid retained eligible responses for each
  of the nine Fatehgarh Sahib parliamentary Assembly segments, without a cap
- Development-only, authorization-gated synthetic progress projection; no
  public administrator route
- Strict TypeScript, Tailwind CSS, ESLint, Prettier and Vitest
- Automated GitHub quality checks
- Dependency-free static export prepared for a separately approved Cloudflare
  Pages public preview

No public survey submission endpoint, production authentication, production database access, payment or public administrative tool is implemented. Cultural-region assignments require human review and are not presented as official classifications.

The English questionnaire and consent remain drafts requiring independent
English, legal/privacy, methodology and accessibility review. English-only
recruitment introduces coverage bias. The target date and response target do
not override any security, privacy, consent, backup or operational gate.

## Requirements

- Node.js 20.9 or newer (Node.js 22 recommended)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000/en`. The root and legacy-language redirects are
Cloudflare/static-preview rules and are not applied by the Next.js development
server.

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
npm run test:step5c
npm run test:step5d
npm run test:step5e
npm run test:targets
npm run build:cloudflare
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
- [English-only site review](docs/readiness/ENGLISH_ONLY_SITE_REVIEW.md)
- [Website and infrastructure audit](docs/readiness/WEBSITE_AND_INFRASTRUCTURE_AUDIT.md)
- [Nine constituency targets](docs/readiness/NINE_CONSTITUENCY_TARGETS.md)
- [4,500-response collection design](docs/readiness/SURVEY_4500_COLLECTION_DESIGN.md)
- [Valid-submission counting rules](docs/readiness/VALID_SUBMISSION_COUNTING_RULES.md)
- [Secure submission verification](docs/readiness/SECURE_SUBMISSION_VERIFICATION.md)
- [Database capacity and recovery](docs/readiness/DATABASE_CAPACITY_AND_RECOVERY.md)
- [Privacy and consent review](docs/readiness/PRIVACY_AND_CONSENT_REVIEW.md)
- [Zero-budget hosting decision](docs/readiness/ZERO_BUDGET_HOSTING_DECISION.md)
- [Public website release check](docs/readiness/PUBLIC_WEBSITE_RELEASE_CHECK.md)
- [Live collection decision](docs/readiness/LIVE_COLLECTION_GO_NO_GO.md)
- [Next-day action plan](docs/readiness/NEXT_DAY_ACTION_PLAN.md)

# Panjab 117

Panjab 117 is an independent multilingual civic research platform covering all 117 Punjab Legislative Assembly constituencies. The current development branch includes a regional discovery interface and a disabled, synthetic-only survey-readiness proof of concept.

## Current scope

- English, Punjabi and Hindi locale routes
- Responsive, accessible editorial homepage
- Provisional Majha, Malwa, Doaba and Puadh discovery directories, clearly separated from official election boundaries
- Source-attributed Fatehgarh Sahib parliamentary-to-Assembly mapping
- Disabled survey schedule, duplicate-screening, editorial-assistance and deterministic-statistics interfaces
- Strict TypeScript, Tailwind CSS, ESLint, Prettier and Vitest
- Automated GitHub quality checks

No survey submissions, authentication, production database access, payments or administrative tools are implemented. Cultural-region assignments require human review and are not presented as official classifications.

## Requirements

- Node.js 20.9 or newer (Node.js 22 recommended)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The root path redirects to English; `/pa` and `/hi` open Punjabi and Hindi respectively.

## Quality commands

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Copy `.env.example` to `.env.local` only when local configuration becomes necessary. Never commit `.env.local` or place secrets in variables prefixed with `NEXT_PUBLIC_`.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Engineering decisions](docs/DECISIONS.md)

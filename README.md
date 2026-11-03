# Panjab 117

Panjab 117 is an independent multilingual civic research platform covering all 117 Punjab Legislative Assembly constituencies. This repository currently contains the initial public frontend and engineering foundation only.

## Current scope

- English, Punjabi and Hindi locale routes
- Responsive, accessible editorial homepage
- Placeholder entry points for constituency research, a future survey and sponsor enquiries
- Strict TypeScript, Tailwind CSS, ESLint, Prettier and Vitest
- Automated GitHub quality checks

No constituency records, survey submissions, authentication, database access, payments or administrative tools are implemented in this phase.

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

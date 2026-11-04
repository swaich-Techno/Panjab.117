# Architecture

## Overview

Panjab 117 is a server-first Next.js App Router application. The current phase is intentionally static: it publishes an accessible multilingual homepage without collecting data or connecting to privileged systems.

## Source organization

```text
src/
├── app/[locale]/       Locale-aware layouts and pages
├── components/         Reusable presentation and navigation components
├── lib/                Locale rules and translation dictionaries
└── proxy.ts            Default-locale redirect and route normalization
```

Most components render on the server. `LanguageSelector` is the only client component because it reads the current pathname and performs in-place locale navigation.

## Routing and internationalization

Every public page is prefixed by one of the supported locales: `en`, `pa` or `hi`. The proxy redirects unprefixed requests to English. The dynamic locale root layout validates the route, sets the document `lang` attribute and supplies localized metadata. Translation dictionaries are typed so missing keys fail during development, and a test verifies their runtime alignment.

Fonts use Unicode-capable local system stacks. This avoids a third-party font request and keeps the initial build deployable without a font service. A later brand phase may self-host approved Gurmukhi and Devanagari font files.

## Styling and accessibility

Tailwind CSS provides layout and component utilities; a small global stylesheet defines typography, reusable buttons, the skip link and reduced-motion behavior. Semantic landmarks, heading order, visible keyboard focus, minimum control sizes and high-contrast colors are built into the initial components.

## Security boundary

This frontend has no database, API mutation routes, identity system, payments, survey form or admin surface. Basic response headers reduce framing, MIME-sniffing and unnecessary browser capabilities. Secrets must stay in server-only environment variables in future phases; anything prefixed with `NEXT_PUBLIC_` is public by design.

Step 5A adds a server-only, synthetic intake contract and draft MySQL schema
without connecting them to the application. The recommended future boundary is
a dedicated intake service, not a mutation route in the static Pages project.
Civic and separately consented political answers use distinct application-level
encryption purposes and raw-review roles. See the
[Step 5A architecture decision](architecture/STEP_5A_ARCHITECTURE_DECISION.md).

Step 5C adds a transport-agnostic HTTPS intake boundary and evidence-backed
activation contract without publishing an endpoint. The static Cloudflare
Pages application remains unable to submit. A future separately hosted intake
service must supply exact release-bound approval evidence, managed secrets,
KMS and private MySQL; environment flags alone cannot authorize collection.
See the [Step 5C implementation](development/STEP_5C_IMPLEMENTATION.md).

## Quality pipeline

Pull requests and pushes to `main` run formatting checks, ESLint, strict TypeScript, Vitest and a production build. The same commands are available locally through npm scripts.

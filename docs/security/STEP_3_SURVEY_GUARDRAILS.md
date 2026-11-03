# Step 3 survey guardrails

## Duplicate and abuse screening

`src/lib/survey/duplicate-screening.ts` is a deterministic, synthetic-only proof of interface design.

- Idempotency keys are SHA-256 digested before store access or logging.
- A canonical answer payload digest can flag an exact duplicate within one survey version and constituency.
- Rate limiting is injected behind an interface; no vendor, network address or browser fingerprint is built in.
- Results use explainable flag codes and plain-language reasons.
- A flag sends a record to human review and preserves an appeal path. It never deletes a response automatically.
- The example log contains only flag codes and a short digest prefix. Raw keys, privacy-scope tokens and answer payloads are excluded.

This cannot establish “one response per person.” Anonymous or pseudonymous intake cannot reliably distinguish one person using multiple contexts from multiple people sharing one context. Any future policy must state that limitation and avoid overstating duplicate controls.

The in-memory stores are test doubles, not concurrent or production-ready implementations. A future implementation needs atomic uniqueness constraints, transaction tests, expiry rules, key separation and a documented retention schedule.

## AI assistance

`src/lib/ai/editorial-assistance.ts` defines a provider-neutral drafting interface. Its checked-in configuration is disabled and prohibits confidential response data.

If enabled in a later approved phase, its scope is limited to neutral public survey descriptions and explanatory multilingual copy. Every draft is saved as a version with source version, provider/model attribution and `awaiting_editorial_review` status. AI output cannot publish itself. No provider package, key, API request or paid resource exists in Step 3.

Generative AI is not used for counts, percentages or aggregations. `src/lib/survey/statistics.ts` performs deterministic aggregation, excludes missing values from the denominator, returns no percentage for a zero denominator, and suppresses both the count and percentage for small cells.

## Authorization

The existing Step 2B deny-by-default role matrix remains unchanged. Public readers, authors, reviewers, ingestion, analysts, privacy officers, security officers and backup operators retain separate simulated operations. Step 3 adds no administrator UI, authentication shortcut, public mutation or expanded grant.

## Unresolved production requirements

- consent content and withdrawal workflow;
- data-protection impact assessment and lawful-basis review;
- production identity, session, CSRF and abuse controls;
- atomic durable idempotency and rate-limit stores;
- encrypted production storage and key management;
- operational monitoring without confidential payloads;
- tested backup, restore, deletion and incident response at production scale;
- survey instrument, sampling method, accessibility review and ethics approval;
- small-cell threshold and disclosure-control policy approved by a survey methodologist.

Until these are resolved and separately approved, survey intake must remain unavailable.

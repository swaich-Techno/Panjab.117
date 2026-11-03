# Step 3 regional and survey-readiness architecture

Date: 2026-11-03  
Runtime timezone observed on the development host: India Standard Time, UTC+05:30  
Collection status: **disabled**

## Route architecture

- `/{locale}` presents the regional entry points for `en`, `pa` and `hi`.
- `/{locale}/regions/{region}` provides a server-rendered GET search over a cultural-region proposal. No search data is persisted.
- `/{locale}/fatehgarh-sahib` presents the official nine-Assembly-segment parliamentary group independently of cultural regions.
- `/{locale}/fatehgarh-sahib/survey` is a server-rendered readiness preview. It has no form, mutation, route handler or submission endpoint.

The route modules remain Server Components. Only the existing language selector is a Client Component.

## Official parliamentary mapping

The [Fatehgarh Sahib District Administration constituency page](https://fatehgarhsahib.nic.in/constituencies/) lists parliamentary constituency 8, Fatehgarh Sahib (SC), with Assembly constituencies 54, 55, 56, 57, 58, 59, 67, 69 and 106. `src/data/fatehgarh-sahib.ts` stores this as a typed, source-attributed mapping and resolves each number through the canonical 117-entry dataset.

## Proposed schedule semantics

The checked-in configuration is `draft`, with `launchApproved: false` and every operational approval false.

| Meaning                     | Asia/Kolkata local time | Stored UTC instant       |
| --------------------------- | ----------------------- | ------------------------ |
| Inclusive opening           | 2026-11-05 00:00:00     | 2026-11-04T18:30:00.000Z |
| Human-readable final second | 2026-11-15 23:59:59     | —                        |
| Exclusive closing boundary  | 2026-11-16 00:00:00     | 2026-11-15T18:30:00.000Z |

Asia/Kolkata has a UTC+05:30 offset for this window. Intake is permitted only when all of these are true on the server:

1. configured state is `open`;
2. current instant is at or after the opening instant and before the exclusive closing instant;
3. explicit launch approval is true; and
4. production security, privacy, consent, backup/recovery and operations approvals are all true.

The state model includes `draft`, `scheduled`, `open`, `paused`, `closed` and `archived`. Paused, closed and archived always fail closed. Tests cover the millisecond immediately before opening, opening itself, the millisecond before closing and the exclusive closing instant.

## Security boundary

`assertSurveyIntakeAllowed` is the reusable server guard for any future mutation path. There is intentionally no current path on which to call it. Adding a form or API route requires a separately approved implementation and threat review; a date or state change alone cannot activate collection.

## Accessibility and localization

- Native Gurmukhi and Devanagari interface text is supplied for all new routes.
- Official constituency proper names remain in the source-record English spelling and are labelled accordingly instead of using unreviewed transliterations.
- Search uses a visible label, semantic GET form and live result count.
- Cards use headings and ordered lists, visible focus treatments, adequate contrast and motion-reduction inherited from the global stylesheet.
- Layouts collapse to a single column on small screens and expand at Tailwind breakpoints without hiding content.

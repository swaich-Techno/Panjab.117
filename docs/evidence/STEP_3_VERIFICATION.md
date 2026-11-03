# Step 3 verification evidence

Date: 2026-11-03  
Branch: `feat/step-2b-synthetic-security-poc`  
Starting HEAD: `1aaefd3c6148186f5db7fe1c8f016bf3d4bbaebf`  
Scope: local development and synthetic fixtures only

## Preservation

The pre-existing uncommitted Step 2B documents, schema changes, package changes and security proof-of-concept files remain in the working tree. No branch switch, reset, rebase, merge, commit, push or deployment was performed.

## Environment and schedule check

The Windows host reported `2026-11-03T19:55:45.4143332+05:30` and the Windows timezone `India Standard Time` (`UTC+05:30`, Chennai/Kolkata/Mumbai/New Delhi) at the start of Step 3 work.

The proposed opening is represented as `2026-11-04T18:30:00.000Z`, equivalent to 2026-11-05 00:00 Asia/Kolkata. The exclusive closing instant is `2026-11-15T18:30:00.000Z`, equivalent to 2026-11-16 00:00 Asia/Kolkata. The checked-in schedule is draft, launch approval is false and all five operational approvals are false.

## Final required commands

| Command                | Actual result                                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run format:check` | Passed; all matched files use Prettier style.                                                                                                       |
| `npm run lint`         | Passed with zero warnings (`--max-warnings=0`).                                                                                                     |
| `npm run typecheck`    | Passed (`tsc --noEmit`).                                                                                                                            |
| `npm run test`         | Passed: 12 files and 102 tests; one file/3 opt-in MySQL integration tests skipped because the default integration environment variables are absent. |
| `npm run build`        | Passed with Next.js 16.4.4; 23 static pages generated and the survey/directory routes compiled as dynamic server routes.                            |

## Local route smoke test

The production build was started temporarily on loopback only and then stopped. HTTP 200 was returned for:

- `/en`, `/pa`, `/hi`;
- `/en/regions/majha?q=Amritsar`;
- `/pa/regions/puadh?q=54`;
- `/hi/fatehgarh-sahib`; and
- `/en/fatehgarh-sahib/survey`.

The rendered survey preview contained no form. No route handler exists under `src/app`, so there is no survey submission endpoint.

## Tests added

- exact 1–117 number continuity and uniqueness;
- all cultural classifications marked for human review;
- exact official Fatehgarh Sahib Assembly-number sequence;
- complete regional text for English, Punjabi and Hindi with native-script checks;
- four directory cards and responsive/focus class contracts for every locale;
- inclusive opening and exclusive closing schedule boundaries;
- explicit launch, operational approval, paused, closed and archived denials;
- idempotency replay, duplicate payload, rate-limit, privacy-safe log and no-auto-delete behavior;
- AI disabled before provider invocation and editorial version creation when explicitly enabled;
- zero denominator, missing values and small-cell suppression; and
- the existing Step 2B deny-by-default authorization tests.

## Recorded intermediate failures

1. An exploratory `npm run test -- --runInBand` invocation failed before running tests because Vitest 5 does not support the Jest-specific flag. The normal project command was then used.
2. The first normal unit run exposed a missing `@` alias in Vitest. The alias was added to `vitest.config.ts`; the final run passed.
3. The first format check reported 16 new files needing formatting. `npm run format` corrected them; the final check passed.
4. A parallel quality attempt caused a transient Windows read error in `node_modules/fast-glob`. The complete required suite was rerun sequentially and passed.

No result above is inferred from a failed or incomplete invocation.

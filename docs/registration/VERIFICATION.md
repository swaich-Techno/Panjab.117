# Party-registration prototype verification

Date: 5 November 2026 (Asia/Kolkata)

Branch: `feat/party-registration-cap-candidate-directory`

Base commit: `47b7dbdaa47aa3786d0990a9e626665e99db18c2`

This evidence was produced locally with synthetic data before the authorized GitHub checkpoint. No deployment or public registration was performed.

## Automated checks

| Check                       | Result                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run format:check`      | Passed                                                                                                                                |
| `npm run lint`              | Passed with zero warnings                                                                                                             |
| `npm run typecheck`         | Passed                                                                                                                                |
| `npm run test:registration` | 6 files passed; 21 tests passed                                                                                                       |
| `npm run test`              | 23 files passed, 1 skipped; 164 tests passed, 3 skipped                                                                               |
| `npm run build:cloudflare`  | Passed; 28 static pages generated                                                                                                     |
| Static-export verifier      | 24 routes, 555 internal references, 145 output files, no runtime functions, indexing disabled                                         |
| `git diff --check`          | Passed                                                                                                                                |
| `npm audit --omit=dev`      | 0 vulnerabilities                                                                                                                     |
| Full `npm audit`            | 8 moderate development-tool findings in a transitive `minimatch` dependency; the suggested forced fix is breaking and was not applied |

The three skipped tests are the existing disposable-MySQL integration tests. No MySQL server was provisioned or run for this branch. The migration and transaction plan therefore remain design evidence, not a real-database concurrency result.

## Registration-domain checks

- A 101-attempt synthetic concurrency test confirms exactly 100 registrations and returns one neutral `capacity_reached` result.
- The cap applies once per active top-level category across all nine segments.
- Exact idempotent retries do not consume another place.
- Duplicate synthetic participants cannot register in another category.
- Only a verified synthetic withdrawal releases capacity.
- Failed synthetic durable writes do not consume capacity.
- The service defaults to the active emergency stop; tests must explicitly disable it for successful synthetic paths.
- The proposed BJP–SAD alliance remains disabled.
- BJP remains available only under `OTHERS`; AD-WPD is labeled as a political organisation with unresolved ECI party-registration status.
- Missing candidate/category combinations use the unannounced fallback.
- Candidate updates append source-backed status history.

## Browser and accessibility evidence

BrowserAct 1.5.0 and local headless Chrome exercised the production-equivalent static export on loopback:

- `/` redirected to `/en/`; the selector order was English, Punjabi, Hindi.
- English, Punjabi and Hindi registration routes rendered with `lang="en"`, `lang="pa"` and `lang="hi"` respectively.
- Punjabi and Hindi displayed explicit pending human-language-review notices.
- Selecting segment 55 and AAP displayed Lakhbir Singh Rai with the official-announcement status.
- The proposed alliance was not interactive.
- The synthetic confirmation button remained disabled until a segment, enabled category and both separate consent acknowledgements were present.
- The completed interaction produced `SYNTHETIC-EN-55-AAP` only in page memory.
- Local storage, session storage and cookies remained empty.
- No submission request occurred. Captured fetch traffic contained only Next.js static-navigation prefetches to the loopback origin.
- Keyboard Tab order began with `Skip to main content`, followed by the brand link and primary navigation.
- Chrome DevTools mobile emulation measured a 390 px viewport with 390 px body/document widths and no overflowing element.

This is not an independent WCAG audit. Manual screen-reader, zoom/reflow and named accessibility review remain required before any public feature release.

## Security scan

The 24 working-tree entries contain no detected private keys, passwords, API keys, database URLs, binaries, real participant records, production connection strings, public submission endpoints or browser-persistence calls. The only `/api/` matches are negative assertions in tests. `package-lock.json` is unchanged and no dependency was added.

All five operational approvals and final launch approval remain false. Public registration and production database configuration remain false, the emergency stop remains active, and external AI remains disabled.

## Remaining blockers

- Named Punjabi and Hindi human review.
- Independent legal/privacy, methodology, accessibility and security review.
- Approved lawful basis, consent text, retention, withdrawal and disclosure-risk policies.
- Production identity, MFA, least privilege, secrets and managed key custody.
- Private production networking, TLS, encrypted backup/PITR and tested restore evidence.
- Real MySQL 8.4 migration, privilege, race, failure and recovery verification.
- Separate authorization, funding and final release approval. At the current ₹0 budget, confidential collection remains blocked rather than weakening participant protections.

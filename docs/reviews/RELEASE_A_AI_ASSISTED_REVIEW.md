# Release A AI-assisted review

## Reviewer status

Reviewer type: **AI-assisted source and editorial review using ChatGPT.**

This is a model-assisted engineering, source, editorial and browser review. It
is not a human attestation, legal opinion, independent accessibility audit or
screen-reader session. Blank human-review records remain pending.

Review date: 6 November 2026 (Asia/Kolkata).

## Exact candidate identity

- Base commit: `a1161628b72e73c8c21e5ab72ed3e46a490534c8`
- Isolated branch: `feat/release-a-content-accessibility-remediation`
- Public-source diff SHA-256: `90beb48cc020c871eb4ed1d24079b124c78742d8e89ae9edaea31314ca437a24`
  - Algorithm: SHA-256 of the UTF-8 Git diff, joined with LF and a final LF,
    for the five release-facing source files listed below.
  - Diff size: 6,710 bytes.
- Static artifact: 60 files, 1,321,571 bytes.
- Canonical artifact-tree SHA-256:
  `14bacd6e2cef0bc8b83659e50ce8bd6052824bfaa3f2b8b94cf315a2288ba0df`
- Distribution ZIP:
  `panjab-117-release-a-remediation-a1161628-14bacd6e.zip`
- ZIP SHA-256:
  `29498a76030ab61e74b94ed7b1203d83dc87ad33de7930593e3d749274e29d79`
- ZIP size: 348,789 bytes.
- Extraction and canonical tree rehash: passed.

The canonical tree hash is SHA-256 over each sorted, forward-slash-normalized
relative path, a NUL byte, the file bytes and a final NUL byte. The original
60-file artifact (`8152e814...`) and ZIP (`a9a1fdb5...`) were independently
rechecked and preserved. They are superseded, not deleted. An intermediate
remediation archive with tree hash `707cdc8d...` was also preserved and is
superseded by the final contrast-corrected artifact above.

This candidate has not been committed, pushed or deployed. Its exact source
identity is therefore the base commit plus the public-source diff hash and the
artifact checksum, not a new commit SHA.

## Source reviewed

The requested English display sources were reviewed in full:

- `src/lib/translations.ts`
- `src/lib/regional-translations.ts`
- `src/lib/survey/consent.ts`
- `src/lib/survey/questionnaire.ts`
- `src/lib/survey/preview-translations.ts`
- `src/components/survey-preview.tsx`

The review also covered the regional and survey pages, site footer, locale and
route configuration, static-export verifier, Cloudflare headers and redirects,
launch controls, public-site tests and the built artifact.

## Findings and corrections

| Severity    | Finding                                                                                                                 | Evidence and correction                                                                                                                                                                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High        | Questionnaire step changes left focus on the removed **Next** button.                                                   | Reproduced in Chrome: after consent, the active element remained the button while the question changed. The client component now focuses each new stage heading with `tabIndex={-1}`, announces the step politely and preserves the assertive validation alert. Forward, backward and keyboard activation were rechecked. |
| Medium      | All regional H1 headings overflowed at 320 CSS pixels because “constituencies” could not wrap.                          | Reproduced on all four regional templates. Added `break-words` to the shared H1 and confirmed zero document-level horizontal overflow at 320 pixels.                                                                                                                                                                      |
| Medium      | Small footer text used `stone-500` on `stone-950`, approximately 4.12:1.                                                | Changed only the placeholder and copyright text token to `stone-400`; the palette ratio is approximately 7.83:1.                                                                                                                                                                                                          |
| Medium      | The survey status was accurate but longer and less direct than the approved preview wording.                            | Replaced it with the exact short status recorded below. The page description now uses the same wording.                                                                                                                                                                                                                   |
| Low         | “Information coming soon” did not state what was incomplete.                                                            | Replaced it with “Verified details are not yet available in this preview.” No contact service or identity was invented.                                                                                                                                                                                                   |
| Low warning | Next.js performs same-origin RSC segment probes that return 404 before a successful route payload or document fallback. | A real Doaba link activation reached the correct URL, title, H1, English document and main landmark. Retained as a non-blocking warning.                                                                                                                                                                                  |
| Low warning | `/favicon.ico` returns 404.                                                                                             | No product-approved icon exists. This is cosmetic and did not affect navigation or accessibility; no invented brand asset was added.                                                                                                                                                                                      |

No correction was required to the questionnaire prompts, separate political
consent, withdrawal limitations, English-coverage-bias disclosure, nine-seat
parliamentary grouping or 500-per-segment minimum target. The source correctly
states that 500 is not a cap, the responses are voluntary and non-random, and
the result must not be described as representative polling or an election
prediction.

## Exact corrected public text

Survey status:

> This survey is currently a preview. Responses are not being accepted.
> Participation dates will be announced after the required privacy, security
> and operational checks are complete.

Previous footer placeholder:

> Information coming soon

Corrected footer placeholder:

> Verified details are not yet available in this preview

The responsible legal entity, verified privacy contact, final retention
periods, withdrawal operations and incident-response commitments remain expert
and owner decisions. They were not guessed or fabricated.

## Browser and accessibility evidence

Browser: Headless Chrome 157.0.0.0 on Windows 10, controlled locally through
BrowserAct and the Chrome DevTools Protocol.

- All seven English routes returned the expected title, English H1,
  `lang="en"`, one main landmark, one footer, a skip link, a canonical URL and
  `noindex, nofollow` metadata.
- All seven routes had no document-level horizontal overflow at 320 CSS
  pixels. The survey route was also checked at 375, 390, 768 and 1440 pixels.
  The 320/375 checks provide equivalent narrow-layout reflow evidence for high
  zoom, but are not a human 200%/400% zoom assessment.
- The skip link received a visible 3-pixel gold outline. Enter moved to
  `#main-content`; the next Tab reached the first main-content link rather than
  returning to header navigation.
- Space selected consent, Tab reached **Next**, and Enter advanced the final
  artifact. Focus then moved to the new question `<legend>`.
- Back navigation returned focus to the previous heading in the development
  verification. The final artifact retained the same tested component.
- Empty-consent validation remained on the consent stage and exposed an
  assertive `role="alert"` message.
- The polite step status changed to “Step 2 of 12”; the progressbar changed to
  17 percent.
- With `prefers-reduced-motion: reduce`, the progress transition duration was
  reduced to `1e-05s` (effectively disabled).
- Sampled normal-text palette ratios passed after remediation; the footer
  token changed from approximately 4.12:1 to 7.83:1.

No human screen-reader, forced-colours or assistive-technology review was
performed. Automated accessibility-tree inspection is not recorded as a
screen-reader pass.

## Route and network evidence

The exact public routes are:

1. `/en/`
2. `/en/regions/majha/`
3. `/en/regions/malwa/`
4. `/en/regions/doaba/`
5. `/en/regions/puadh/`
6. `/en/fatehgarh-sahib/`
7. `/en/fatehgarh-sahib/survey/`

The root returned `302 /en/`. Punjabi and Hindi legacy paths returned permanent
English redirects while preserving nested paths and query strings. Unknown
English routes returned the static 404 page with the security headers intact.

Captured application requests were same-origin GET or HEAD requests. No POST,
external tracker, submission request or AI request appeared. The regional
pages contain a labelled client-side constituency-search form whose submit
handler calls `preventDefault()`; it is not a survey or network submission.
The survey page contains no `<form>` and no submit control.

## Security and privacy boundary

Confirmed from source and artifact:

- seven English routes only; legacy Punjabi/Hindi routes redirect;
- no public route handler, survey intake API or Cloudflare runtime Function;
- no production database connection or participant record;
- no local storage, session storage, IndexedDB or response persistence in the
  public components;
- no external AI provider or tracking request;
- no source maps, generated secrets, credentials, keys or connection strings
  in the 60-file artifact;
- CSP, HSTS, frame, content-type, referrer, permissions and noindex headers
  served by the local production-equivalent server;
- live collection, final launch approval and all five operational approvals
  remain `false`; and
- authorized spending remained ₹0.

`npm audit --omit=dev` reported zero production vulnerabilities. The complete
development tree reported eight moderate findings through the ESLint
TypeScript/minimatch toolchain; no dependency was changed automatically.

## Verification results

| Check                          | Result                                                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `npm.cmd run format:check`     | Passed                                                                                       |
| `npm.cmd run lint`             | Passed with zero warnings                                                                    |
| `npm.cmd run typecheck`        | Passed                                                                                       |
| `npm.cmd run test`             | 34 files passed, 2 skipped; 297 tests passed, 15 skipped                                     |
| `npm.cmd run build:cloudflare` | Passed; 7 routes, 60 files, 148 internal references, no runtime Functions, indexing disabled |
| `git diff --check`             | Passed                                                                                       |
| ZIP extraction and tree rehash | Passed                                                                                       |

The 15 skips are the disposable MySQL integration tests. No disposable server
was started, so no fresh MySQL result is claimed.

## External evidence still required

- A real English-content reviewer must complete the candidate-specific form.
- A real accessibility reviewer must complete the candidate-specific form,
  including actual keyboard, zoom/reflow and assistive-technology results.
- Independent legal/privacy decisions remain required for genuine collection.
- Cloudflare blocked automated read-only dashboard access with its normal
  human-verification challenge. The owner must record the current production
  deployment and a verified successful production rollback target using the
  dashboard instructions. No deployment ID was invented.
- The owner must issue separate authorization for any static deployment.

## Decisions

**Release A: NO-GO.** Engineering remediation and the local static artifact are
complete, but human content/accessibility decisions, Cloudflare current and
rollback deployment evidence, and explicit deployment authorization are still
missing.

**Release B: NO-GO.** Genuine confidential survey collection remains disabled
regardless of the 4,500-response minimum target.

## Changed-file inventory

Release-facing source:

- `src/app/[locale]/regions/[region]/page.tsx`
- `src/components/site-footer.tsx`
- `src/components/survey-preview.tsx`
- `src/lib/regional-translations.ts`
- `src/lib/translations.ts`

Regression tests:

- `src/components/survey-preview.test.ts`
- `src/lib/public-site.test.ts`
- `src/lib/regional-translations.test.ts`

Review and release evidence:

- `docs/reviews/RELEASE_A_AI_ASSISTED_REVIEW.md`
- `docs/reviews/RELEASE_A_ENGLISH_CONTENT_REVIEW_FORM.md`
- `docs/reviews/RELEASE_A_ACCESSIBILITY_REVIEW_FORM.md`
- `docs/deployment/CLOUDFLARE_RELEASE_EVIDENCE_INSTRUCTIONS.md`
- `docs/readiness/RSC_PREFETCH_404_REVIEW.md`
- `docs/readiness/PUBLIC_WEBSITE_RELEASE_CHECK.md`

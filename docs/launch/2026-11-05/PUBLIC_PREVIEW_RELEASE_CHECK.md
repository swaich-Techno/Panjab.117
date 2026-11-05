# Public-preview release check

## Live website audit

Browser audit of `https://panjab-117.pages.dev/` found:

- homepage and English, Punjabi and Hindi routes load;
- `/` currently redirects to `/en/`;
- language metadata matches each locale;
- the Fatehgarh Sahib landing and survey-preview pages load;
- the preview contains no form or submit control;
- local storage and session storage remained empty;
- no fetch/XHR submission was observed;
- indexing remains disabled;
- the live preview still presents 5–15 November 2026 as a proposed window;
- the language selector is ordered English, Punjabi, Hindi on the live deployment.

The live site therefore remains read-only, but its date and language-priority copy should be corrected before a confident launch announcement.

## Local release-candidate evidence

Production-equivalent export checks:

- root: HTTP 302 to `/pa/`;
- Punjabi, Hindi and English home, landing and survey routes: HTTP 200;
- missing route: HTTP 404;
- document languages: `pa`, `hi`, `en` respectively;
- survey routes: zero forms and no old 5/15 November dates;
- `X-Robots-Tag`: `noindex, nofollow, noarchive`;
- CSP contains `connect-src 'self'`;
- export: 21 routes, 486 internal references, 129 output files, no runtime functions;
- language options: `pa`, `hi`, `en`.

Chrome 156 DevTools emulation was run at 320×800, 375×812, 768×1024 and 1440×1000. At every width, `innerWidth` matched the requested width, document width did not overflow, and the language selector was fully visible. Only local GET/HEAD requests occurred. Local and session storage remained empty. Tab navigation reached the skip link, identity link, language control and navigation links; visible focus was observed. The language selector’s final computed focus state was `:focus-visible` with a solid 2 px outline.

No screen-reader test was executed. Punjabi/Hindi linguistic quality and mobile assistive-technology use still require human review.

## Security/header configuration

The static `_headers` policy retains CSP, HSTS, frame denial, MIME sniffing protection, restrictive permissions, referrer controls and `X-Robots-Tag`. `_redirects` contains only the temporary root redirect to Punjabi. No function bundle, API path, analytics tag, tracking pixel, database connector or submission endpoint is introduced.

## Release procedure requiring separate approval

1. Project lead reviews the complete diff and obtains Punjabi/Hindi and accessibility review.
2. Grant separate authorization to stage, commit and push this branch.
3. Confirm the pushed SHA and inspect the Cloudflare build preview using `npm run build:cloudflare` and output directory `out`.
4. Re-run the route/header/browser checklist on that preview URL.
5. Grant separate authorization to promote the exact verified static deployment.
6. Verify `/` redirects to `/pa/`, inspect all three languages, and retain indexing disabled.

Rollback: select the last known-good Cloudflare Pages deployment for commit `958c4b37a958dafbf7a83324ed350a49d3cf02ad`. A rollback restores the old language order and dates, so public messaging must again state that collection is postponed.

Current Cloudflare production was not changed.

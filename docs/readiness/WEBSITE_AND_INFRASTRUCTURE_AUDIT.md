# Website and infrastructure audit

Status: static public preview preserved; production collection unavailable.

## Live deployment observation

A read-only check of `https://panjab-117.pages.dev/en/` on 6 November 2026
still showed the previously deployed multilingual selector and wording. The
live survey preview still stated that intake was unavailable and that no form
or endpoint existed, but it also showed the older proposed 5-15 November dates.
This confirms that the local English-only artifact was not deployed and that
the current live artifact is not the corrected Release A candidate.

## Public website

The Next.js 16 application exports static files to `out`. The public artifact
contains no Next.js runtime, Pages Function, Worker, API route, database
binding, AI provider or survey submission endpoint. Cloudflare `_headers`
retains CSP, HSTS, frame denial, MIME sniffing protection, restrictive
permissions policy and `noindex` controls. `_redirects` handles root and
legacy-language traffic without JavaScript.

The public preview remains a read-only questionnaire demonstration. Answers
exist only in volatile React state and disappear on reload. Source checks must
continue to reject `localStorage`, `sessionStorage`, IndexedDB, cookies,
`fetch`, XMLHttpRequest and form actions in the public survey path.

## Imported development-only components

The integration worktree contains the previously reviewed Step 5A-5E
synthetic intake, encryption, audit/outbox, withdrawal, recovery, screening,
MySQL migrations and loopback staging harness. They are not referenced by any
public static route and do not configure a production host or database.

## Components missing for genuine collection

Genuine collection still needs a separately deployed HTTPS intake service,
managed workload identity, private MySQL connectivity, separate civic and
political keys, a secrets/KMS administrator, administrator MFA, monitored
audit delivery, tested encrypted backups and PITR, a withdrawal service that
remains available after close, retention/deletion operations, incident
response coverage, provider contracts and jurisdiction review, capacity and
load evidence, and release-bound signed approvals.

`npm audit --omit=dev` reported zero production vulnerabilities. The complete
development tree reported eight moderate `minimatch` advisories nested under
`eslint-config-next`/typescript-eslint; npm's suggested forced resolution
would install a breaking older Next ESLint configuration, so no automatic
dependency rewrite was made.

Cloudflare Pages Free is appropriate for the static preview only. Its published
limits include 500 monthly builds, 20,000 files and 25 MiB per asset:
https://developers.cloudflare.com/pages/platform/limits/

# Release A PANJAB-branding artifact evidence

Evidence date: 7 November 2026.

## Identity

- Source branch: `feat/panjab-branding-website-infrastructure`
- Exact source commit: `9319c1dcee615fd387e0a5333c366aefb5cd3cda`
- Artifact directory: `panjab-117-release-a-branding-9319c1d`
- Artifact files: 667
- Artifact bytes: 12,640,183
- Canonical artifact-tree SHA-256:
  `ac32265832d95a71a4de916b165896a6dd337278abfd98ceb45ff34b84671b61`
- Distribution ZIP bytes: 2,938,080
- ZIP SHA-256:
  `0e5655a81d56ecb231af5ee7e59d959b5ba6a8ea1ed3c6e826b121f8322944c3`

The tree hash is SHA-256 over every sorted, forward-slash-normalized relative
path, a NUL byte, the file bytes and a final NUL byte. The ZIP was extracted to
a separate verification directory; the extraction contained the same 667
files, 12,640,183 bytes and tree hash. The temporary extraction directory was
then removed. Older artifacts were not modified.

## Static and browser verification

- Next.js 16.4.4 generated 129 static pages.
- The verifier passed 125 public routes, including all 117 constituency
  profiles, and checked 3,622 internal references.
- The output contains no Pages Function or other runtime function.
- Root and legacy-language redirects, two header rules, noindex, CSP and the
  read-only survey boundary passed.
- The branding verifier requires the exact `PANJAB 117` organization name,
  `PUNJAB` state spelling and homepage headline in HTML and social metadata.
- Local Chrome/Playwright covered six representative routes, 18 responsive
  checks at 320–1440 CSS pixels, simulated 200% zoom, keyboard controls,
  reduced motion and all eight questionnaire stages.
- Browser traffic was GET-only, with zero external requests and zero 404
  responses.
- BrowserAct's installed `uv` trampoline could not canonicalize its script
  path. The checked-in local Chrome/Playwright verifier was used instead. This
  is not a human assistive-technology review.

## Quality and security results

| Check                              | Result                          |
| ---------------------------------- | ------------------------------- |
| `npm.cmd run format:check`         | Passed                          |
| `npm.cmd run lint`                 | Passed; zero warnings           |
| `npm.cmd run typecheck`            | Passed                          |
| `npm.cmd run test`                 | 311 passed, 15 skipped          |
| `npm.cmd run test:security:intake` | 51 passed                       |
| `npm.cmd run test:step5c`          | 18 passed                       |
| `npm.cmd run test:step5d`          | 42 passed                       |
| `npm.cmd run test:step5e`          | 14 passed                       |
| `npm.cmd run test:targets`         | 11 passed                       |
| `npm.cmd run build:cloudflare`     | Passed                          |
| `git diff --check`                 | Passed before the source commit |
| production dependency audit        | 0 vulnerabilities               |
| complete development audit         | 8 moderate; 0 high/critical     |

The 15 skips are the disposable MySQL integration tests. No disposable server
was authorized for this run, so no fresh MySQL pass is claimed. The eight
moderate development findings are the `minimatch` advisory propagated through
the ESLint/TypeScript tooling; npm's proposed automatic resolution would
downgrade the Next.js ESLint package across a major boundary, so it was not
applied without compatibility review.

## Review coverage

Harkirat's genuine owner editorial approval remains recorded for commit
`e2847f61e6f3672a9b39cb13447b2c1fd7815423`. It is not independent and does
not cover this candidate's PANJAB/PUNJAB copy and metadata changes. A search of
available project review records and supplied attachments found no completed
independent English or human assistive-technology decision with reviewer,
qualifications, exact artifact, findings, decision and evidence reference.

The branding-delta and accessibility gates therefore remain pending.

## Cloudflare status

Read-only HTTPS checks on 7 November 2026 returned 200 for production and
historical deployment `100d72ea-b09d-4ac6-a24f-e51fdf5a7b78`. Their homepage
body hashes matched, and production did not contain the new brand headline.
This proves the new candidate was not deployed. It does not prove that the
historical deployment remains selectable in the dashboard; rollback evidence
is still pending.

No push, deployment, DNS change, Cloudflare mutation, AI activation, billing or
survey collection occurred.

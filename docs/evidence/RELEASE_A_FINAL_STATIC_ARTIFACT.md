# Release A final static-artifact evidence

## Candidate identity

- Source commit: `58ad5d33251990904de875fb4b02a0c430e1c5fb`
- Branch: `feat/final-website-design-nov7`
- Artifact directory:
  `panjab-117-release-a-final-58ad5d3-02fabbca`
- ZIP: `panjab-117-release-a-final-58ad5d3-02fabbca.zip`
- Artifact files: 667
- Artifact bytes: 12,113,704
- ZIP bytes: 2,843,742
- Canonical artifact-tree SHA-256:
  `02fabbca564b873726a2cdf3c50feeb322fe6f8784a31f76f62015a2729c3605`
- ZIP SHA-256:
  `47d3b8cfc4c118ca28f6b4b33f8922ad49900bcf980a77905ce191c6a6fd4a4a`

The canonical tree hash is SHA-256 over every sorted,
forward-slash-normalized relative path, a NUL byte, the file bytes and a final
NUL byte. Extracting the ZIP produced the same 667 files, 12,113,704 bytes and
canonical tree hash.

## Static verification

- Next.js generated 129 static pages.
- The public-route verifier passed 125 routes, including all 117 constituency
  profiles.
- It checked 3,622 internal references.
- Root, Punjabi legacy and Hindi legacy redirects passed.
- Cloudflare `_headers` contains CSP, COOP, CORP, HSTS, frame, content-type,
  DNS-prefetch, referrer, permissions and noindex controls.
- Search indexing remains disabled.
- No runtime Function, Worker, route handler or source map is present.
- The largest exported file is 242,305 bytes.
- Static-artifact secret and endpoint patterns produced only three framework
  vocabulary matches for HTML password-input handling and URL parsing; no
  credential, private key, connection string or intake endpoint was found.

## Browser verification

Local Chrome verified representative homepage, regional, constituency,
Fatehgarh Sahib and survey routes. The run covered widths 320, 375, 390, 768,
1024 and 1440 pixels, simulated 200% zoom, keyboard activation, reduced motion
and all eight questionnaire stages. It observed zero 404 responses, no external
request and GET-only traffic.

BrowserAct itself could not start because its installed `uv` trampoline could
not canonicalize the script path. The repeatable local Playwright verifier was
used against the exact static output instead.

## Quality results

| Check                               | Result                                           |
| ----------------------------------- | ------------------------------------------------ |
| `npm.cmd run format:check`          | Passed                                           |
| `npm.cmd run lint`                  | Passed, zero warnings                            |
| `npm.cmd run typecheck`             | Passed                                           |
| `npm.cmd run test`                  | Passed on isolated rerun: 302 passed, 15 skipped |
| `npm.cmd run build:cloudflare`      | Passed                                           |
| ZIP extraction and canonical rehash | Passed                                           |

The first unit-test run was concurrent with formatting, lint and type-checking;
one nonce-uniqueness test exceeded its five-second timeout, with 301 tests
passing. The unchanged suite was rerun alone and passed all 302 non-MySQL tests.
The 15 skips remain disposable MySQL integration tests; no fresh MySQL run is
claimed.

## Security boundary

Live collection, final launch approval, all five operational approvals and the
AI provider remain disabled. The artifact contains no submission endpoint,
participant persistence or production database connection. This evidence does
not authorize deployment or Release B.

# Step 4C local verification evidence

- Date: 2026-11-04
- Branch: `feat/step-4c-cloudflare-public-preview`
- Base: `aa1a82b498628b5dadeca3efa2a227130b4b3703`
- Deployment status: not connected and not deployed

## Static-export facts

- Initial build: failed because `/robots.txt` required explicit static metadata
  configuration under `output: "export"`.
- Resolution: `robots.ts` and `sitemap.ts` declare `dynamic = "force-static"`.
- Subsequent build: passed and emitted only static/SSG routes.
- Artifact verification: 21 routes, 486 internal references, 129 files, largest
  file 229,288 bytes, two `_headers` rules, no Function or Worker.
- Indexing: disabled by route metadata, `robots.txt` and `X-Robots-Tag`.
- Survey: no form, submit endpoint, network request or persistent storage.

## Final command results

```text
npm run format:check     PASS (2.85 s)
npm run lint             PASS, zero warnings (11.77 s)
npm run typecheck        PASS (3.85 s)
npm run test             PASS (17 files passed, 1 skipped; 140 tests passed,
                              3 skipped; Vitest 1.92 s, command 3.56 s)
npm run build:cloudflare PASS (Next.js 16.4.4 static build plus artifact
                              verification, 14.90 s)
git diff --check         PASS
```

The build generated 25 static pages and the artifact verifier confirmed 21
public routes, 486 internal references, 129 files, a 229,288-byte largest file,
two header rules, disabled indexing and no runtime Function or Worker.

The local production-equivalent HTTP audit confirmed:

- all 21 routes returned 200 with the correct document language;
- all 10 required security headers were present;
- `/` returned 302 to `/en/`;
- an unknown path returned the generated 404;
- `_headers` and `_redirects` were not served as public files;
- a hashed JavaScript asset returned the immutable one-year cache policy;
- no cookie or survey form was observed; and
- an encoded script probe was not reflected.

## Browser evidence limitation

BrowserAct and `uv` were unavailable, so no rendered cross-browser/mobile or
screen-reader sign-off was produced. The independent procedure is documented
in `docs/checklists/STEP_4C_BROWSER_ACCESSIBILITY.md` and remains a release
blocker.

## Approval-required actions

1. approve the Cloudflare account and free-plan use;
2. approve the project name and proposed `panjab-117.pages.dev` hostname;
3. authorize Cloudflare GitHub App repository access and branch controls;
4. approve an immutable deployment commit;
5. authorize the first preview/production deployment separately;
6. approve any DNS or custom-domain work separately;
7. accept independent browser, accessibility and linguistic evidence;
8. exercise and accept rollback evidence; and
9. separately authorize search indexing, if ever desired.

Live survey collection, production intake, AI and infrastructure remain outside
this release and require their existing independent gates.

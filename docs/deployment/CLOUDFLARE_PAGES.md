# Cloudflare Pages public-preview configuration

This is a proposal only. No Cloudflare account, GitHub application, project,
domain, deployment or paid resource has been created.

## Proposed project

- Project name and free subdomain: `panjab-117` / `panjab-117.pages.dev`
- Availability: **not checked and not reserved**
- Alternative if unavailable: owner must approve a new name
- Important: Cloudflare documents that a `pages.dev` subdomain cannot be
  renamed without deleting the project, so the name requires approval first.

## Build settings

| Setting          | Proposed value                |
| ---------------- | ----------------------------- |
| Repository       | `swaich-Techno/Panjab.117`    |
| Framework preset | Next.js (Static HTML Export)  |
| Build command    | `npm run build:cloudflare`    |
| Output directory | `out`                         |
| Root directory   | repository root               |
| Node version     | `22.23.4` via `.node-version` |
| Pages Functions  | none                          |
| Worker           | none                          |

Build variables contain no secrets:

```text
NEXT_PUBLIC_SITE_URL=https://panjab-117.pages.dev
PUBLIC_PREVIEW_INDEXING_ENABLED=false
```

The origin value must use the approved, actually assigned hostname. Indexing
must remain false for the initial preview. The committed `X-Robots-Tag` header
also blocks indexing and requires a reviewed code change before it can be
removed.

## GitHub integration proposal

1. Obtain explicit approval for the Cloudflare account, project name and
   GitHub App repository access.
2. Import only `swaich-Techno/Panjab.117` through Workers & Pages.
3. Keep automatic production deployments disabled while configuration is
   reviewed.
4. Limit preview-branch builds to the explicitly approved branch.
5. Record the exact commit SHA, build log and generated preview URL.
6. Complete the release checklist before approving a production deployment.

Cloudflare notes that a Git-integrated Pages project cannot later be converted
to Direct Upload. This choice therefore requires owner approval rather than a
trial connection.

Official references:

- <https://developers.cloudflare.com/pages/configuration/git-integration/>
- <https://developers.cloudflare.com/pages/configuration/branch-build-controls/>
- <https://developers.cloudflare.com/pages/configuration/build-configuration/>
- <https://developers.cloudflare.com/pages/configuration/build-image/>

## Free-plan limits checked on 2026-11-04

These are documented limits, not guarantees of future availability:

| Limit                      | Cloudflare Free value         | Current local artifact       |
| -------------------------- | ----------------------------- | ---------------------------- |
| concurrent builds          | 1                             | not applicable locally       |
| builds per month           | 500                           | no Cloudflare builds used    |
| build timeout              | 20 minutes                    | local build below one minute |
| projects per account       | 100                           | account not inspected        |
| custom domains per project | 100                           | none requested               |
| files per deployment       | 20,000                        | 129 files                    |
| maximum asset size         | 25 MiB                        | 229,288 bytes                |
| active preview deployments | unlimited                     | none created                 |
| `_headers` rules           | 100                           | 2 rules                      |
| `_headers` line length     | 2,000 characters              | below limit                  |
| `_redirects` rules         | 2,000 static plus 100 dynamic | 1 static redirect            |

Source: <https://developers.cloudflare.com/pages/platform/limits/>

## Security headers and cache behavior

`public/_headers` is copied into `out/_headers` and applies CSP, frame,
content-type, referrer, permissions, cross-origin, HSTS and no-index policies.
Hashed Next.js assets receive a one-year immutable browser cache policy. HTML
does not receive a custom long-lived cache rule.

Cloudflare parses `_headers` rather than serving it as an asset. Header rules
apply to static assets but not Pages Functions; this project deliberately has
no Functions.

After an approved deployment, capture `curl -I` evidence for `/en/`, all three
survey routes, a hashed asset, `robots.txt`, a 404 response and the root
redirect. Compare every value with `src/lib/security/public-headers.ts`.

References:

- <https://developers.cloudflare.com/pages/configuration/headers/>
- <https://developers.cloudflare.com/pages/configuration/redirects/>

## TLS and DNS

The initial proposal uses only the assigned `pages.dev` hostname. Cloudflare
connection, custom DNS, custom domains and DNS changes are all outside Step 4C.
TLS and redirect behavior must be inspected externally after an approved
deployment; local testing cannot prove either edge property.

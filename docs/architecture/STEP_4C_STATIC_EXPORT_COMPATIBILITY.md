# Step 4C static-export compatibility

## Decision

The existing Next.js 16.4.4 App Router application is compatible with a static
export after small, bounded adaptations. No framework rewrite, migration or
Cloudflare Worker is justified for the read-only public preview.

The official Next.js static-export documentation excludes Proxy, runtime
headers, redirects and request-time behavior. Cloudflare Pages explicitly
supports Next.js static HTML exports with an `out` build directory.

- Next.js static exports:
  <https://nextjs.org/docs/app/guides/static-exports>
- Next.js Proxy platform support:
  <https://nextjs.org/docs/app/api-reference/file-conventions/proxy>
- Cloudflare static Next.js guide:
  <https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/>

## Compatibility matrix

| Existing behavior                          | Static-export issue                             | Step 4C adaptation                                                          | Essential behavior retained |
| ------------------------------------------ | ----------------------------------------------- | --------------------------------------------------------------------------- | --------------------------- |
| `src/proxy.ts` redirects `/` to English    | Proxy is not supported                          | `public/_redirects` issues `/` to `/en/` HTTP 302                           | yes                         |
| region page reads request `searchParams`   | arbitrary request queries need a runtime        | small client component filters already-public records in memory             | yes                         |
| survey page declares `force-dynamic`       | dynamic rendering cannot be exported            | remove the declaration and evaluate the disabled schedule deterministically | yes                         |
| `next.config.ts` supplies response headers | runtime headers are unsupported                 | `public/_headers` applies the same policy to static assets                  | yes                         |
| metadata routes read safe build variables  | metadata routes require an explicit static mode | `robots.ts` and `sitemap.ts` use `force-static`                             | yes                         |

The first local export failed only because `/robots.txt` lacked the explicit
`force-static` declaration. Adding it to both metadata routes produced a
complete export. This failure and resolution are retained as verification
evidence rather than hidden.

## Preserved content and routes

- 117 unique Assembly constituency records across Majha, Malwa, Doaba and
  Puadh;
- Fatehgarh Sahib Assembly segments 54, 55, 56, 57, 58, 59, 67, 69 and 106;
- English, Punjabi and Hindi routes and language alternates;
- the interactive survey preview, which keeps answers only in React memory;
- disabled search indexing at metadata, `robots.txt` and HTTP-header layers;
- launch approval plus production-security, privacy, consent,
  backup/recovery and operations approvals all set to `false`; and
- no API, route handler, server action, database, AI provider, analytics or
  response persistence.

## Accepted static-preview trade-offs

- The root locale redirect is hosting configuration rather than application
  code.
- Directory search is client-side. The full public directory remains readable
  in the initial HTML before JavaScript runs.
- Schedule availability is build-time evidence only. The schedule remains
  `draft`, every approval remains false, and no date can enable collection.
- Security-header verification must be repeated against the deployed Pages
  response because local files cannot prove edge behavior.
- Unknown paths use the generated static `404.html`; there is no dynamic
  fallback.

## Why Workers are not selected

Cloudflare Workers would reintroduce a runtime, adapter compatibility surface
and additional operational controls without enabling any approved requirement.
Static Pages has the smaller attack surface and preserves every essential
public-preview feature. If a later approved phase requires request-time code,
the project must compare Workers adapter support, security controls, limits and
costs in a new decision before migration.

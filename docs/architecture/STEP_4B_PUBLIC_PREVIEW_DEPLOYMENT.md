# Step 4B public-preview deployment proposal

Status: **proposal only; no project, domain, DNS record or deployment created**

The public-preview objective is a read-only multilingual site. It does not need
a database, survey API, AI provider, analytics service or production secret.
Live collection is a separate system and approval gate.

## Hosting candidate

Vercel Git integration is the lowest-friction evaluation candidate for the
current Next.js 16 application because it supports native Next.js builds,
automatic HTTPS and commit-addressed preview deployments. Vercel Hobby may be
used only if the account owner confirms that the project satisfies the current
personal/non-commercial fair-use terms and accepts the free-tier limits. It is
not an assumed entitlement and no account has been linked.

Relevant official documentation:

- [Vercel plans](https://vercel.com/docs/plans)
- [Vercel limits](https://vercel.com/docs/limits)
- [custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [automatic SSL certificates](https://vercel.com/docs/domains/working-with-ssl)
- [instant rollback](https://vercel.com/docs/instant-rollback)

Cloudflare Pages/Workers remains a possible zero-cost alternative, but the team
must first validate current Next.js adapter compatibility, dynamic route
behavior, build limits and rollback semantics. Do not combine providers merely
to appear redundant; every provider adds configuration and privacy surface.

## Safe-default environment

| Variable                          | Classification | Public-preview value                                      |
| --------------------------------- | -------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | public config  | verified canonical HTTPS origin; never a secret           |
| `PUBLIC_PREVIEW_INDEXING_ENABLED` | public gate    | `false` until content, domain and deployment are approved |

No database URL, encryption key, HMAC key, AI token or administrative
credential is required for the preview. Secrets must never use a
`NEXT_PUBLIC_` prefix.

## DNS and TLS procedure

1. Owner supplies and proves control of the intended domain.
2. Record the existing DNS zone before change and choose one canonical host.
3. Add the host to the reviewed provider project without changing DNS.
4. Prepare the exact provider-supplied A/AAAA/CNAME records and low-risk TTL.
5. Obtain explicit DNS-change and deployment approval.
6. Apply only the approved records; verify resolution from multiple resolvers.
7. Verify the certificate chain, hostname, renewal ownership and HTTP-to-HTTPS
   redirect before enabling indexing.
8. Confirm the apex/`www` redirect cannot create duplicate canonical origins.

HSTS is configured without `includeSubDomains` or preload. Expanding HSTS scope
requires a separate subdomain inventory because it can make unrelated HTTP-only
hosts unreachable.

## Headers and caching

`next.config.ts` applies CSP, frame denial, MIME sniffing protection, restrictive
permissions, same-origin opener/resource policies, referrer control and HSTS.
The CSP permits Next.js inline bootstrap scripts and styles but blocks external
scripts, objects, frames and non-self network connections. A nonce-based CSP is
a future hardening item if the rendering model permits it.

Expected caching policy to verify on the candidate deployment:

- hashed `/_next/static/` assets: provider-managed immutable caching;
- public HTML: provider/framework defaults with revalidation, never private
  participant data;
- survey preview: current status must not be served from an unreviewed stale
  cache; verify response headers after deployment;
- `robots.txt` and `sitemap.xml`: indexing stays fail-closed until both the
  verified origin and explicit indexing flag are present.

## Release and rollback proposal

1. Require the repository quality workflow on the exact commit.
2. Build a non-production preview from that commit.
3. Verify English, Punjabi and Hindi routes, headers, navigation, mobile layout,
   static-data exposure and absence of mutation requests.
4. Record the immutable deployment ID and evidence.
5. Obtain explicit public-preview deployment approval.
6. Promote the tested build rather than rebuilding different source.
7. Run post-release smoke/header checks before enabling indexing.

Rollback means restoring the last verified production deployment, confirming
the domain alias and disabling indexing if status is uncertain. Vercel Hobby
currently limits instant rollback to the immediately previous deployment, so a
source-tagged rebuild plan and retained verification evidence are also required.

## Deployment blockers

- verified domain and DNS owner;
- provider/fair-use eligibility decision;
- approved canonical URL and indexing decision;
- independent content/language/accessibility review evidence;
- rendered-browser and mobile verification;
- exact security-header and cache observations from the candidate deployment;
- named release owner and rollback operator; and
- separate explicit authorization to deploy.

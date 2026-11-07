# Static-site operations plan

Scope: the English-only, read-only Cloudflare Pages site. This plan does not
cover genuine survey intake and does not authorize deployment.

## Privacy-preserving monitoring

- Use Cloudflare's project/deployment status and GitHub Actions build status;
  do not add visitor-level analytics, session replay, trackers or advertising.
- Once daily, an authorized operator checks `/en/`, one constituency profile,
  the Fatehgarh Sahib overview, survey preview, `/404.html`, root redirect and
  the security headers. Record only timestamp, route, status, latency band and
  deployment ID—never client IPs or visitor identifiers.
- Treat any unexpected POST, external request, missing noindex/CSP header,
  survey-acceptance claim or runtime function as a security incident.
- GitHub dependency and code-scanning alerts are triaged weekly. Production
  dependency findings take priority; development-only findings are recorded
  separately and must not be hidden.

## Deployment failure and rollback

1. A failed quality or Pages build blocks promotion. Record the failing commit
   and build URL; do not retry by weakening tests.
2. Before any production promotion, record the candidate commit, artifact tree
   hash, ZIP hash, Cloudflare deployment ID and a dashboard-confirmed selectable
   last-known-good deployment.
3. If post-release route, redirect, header, navigation or read-only checks fail,
   stop further changes and use the dashboard's supported rollback mechanism to
   restore the recorded deployment.
4. Recheck the same routes and headers after rollback. If dashboard rollback is
   unavailable, Release A is NO-GO until a supported restoration method is
   proven.

Known historical deployment `100d72ea-b09d-4ac6-a24f-e51fdf5a7b78` is a
proposed last-known-good baseline only. Its current dashboard selectability has
not been verified, so it is not yet valid rollback evidence.

## Incident record

Create one dated record containing discovery time, affected deployment and
routes, symptoms, public impact, data impact (normally none for this static
site), containment, rollback action, validation evidence, root cause, owner and
follow-up. Do not copy credentials, tokens, visitor data or sensitive answers
into an incident document.

## Ownership

- Project owner: approves production promotion and public wording.
- Release operator: runs the frozen-artifact and post-release checks and may
  execute only a pre-authorized rollback.
- Security reviewer: reviews header, dependency and unexpected-network findings.
- No static-site role receives survey responses or production database access.

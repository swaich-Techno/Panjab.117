# Step 4C public-preview release checklist

Target date: 5 November 2026. The date is a planning target and cannot waive a
blocked control.

## Local engineering evidence

- [x] static export produces 21 English, Punjabi and Hindi routes;
- [x] 117 records, four provisional directories and nine Fatehgarh Sahib
      segments remain covered by deterministic tests;
- [x] survey preview contains no form, endpoint or persistence;
- [x] `robots.txt`, metadata and `_headers` block indexing;
- [x] CSP and other headers are represented in Cloudflare format;
- [x] root redirect and static 404 behavior are configured;
- [x] static navigation and asset references pass automated checks;
- [x] launch approval and all five operational approvals are false;
- [x] AI remains disabled; and
- [x] format, lint, type, unit, build and static-artifact checks pass locally.

## Blocked before any Cloudflare connection

- [ ] owner approves the Cloudflare account and free-plan eligibility;
- [ ] owner approves the immutable project/subdomain name;
- [ ] owner approves GitHub App access to the repository;
- [ ] production and preview branch controls are approved;
- [ ] exact deployment commit is approved;
- [ ] human Punjabi and Hindi review is signed;
- [ ] independent keyboard, screen-reader, zoom and mobile checks pass; and
- [ ] privacy/legal and methodology publication review is accepted.

## Blocked before public production alias

- [ ] external TLS and root redirect evidence passes;
- [ ] deployed CSP and all security headers match the source policy;
- [ ] deployed `robots.txt`, metadata and `X-Robots-Tag` block indexing;
- [ ] deployed 404 and asset-cache behavior pass;
- [ ] browser network inspection shows no response transmission or analytics;
- [ ] rollback to a prior production deployment is exercised;
- [ ] release owner records the immutable SHA and approval; and
- [ ] public-preview deployment receives separate authorization.

## Live survey collection remains independently blocked

The Step 4B live-collection checklist remains authoritative. Public-preview
approval cannot change the schedule state, launch approval, any operational
approval or the absence of an intake endpoint.

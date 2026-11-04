# Step 4C Cloudflare Pages rollback procedure

No rollback has been executed because no Pages project or deployment exists.
This procedure must be exercised after deployment is separately approved.

## Preconditions

- identify the current production deployment, commit SHA and release owner;
- identify a previously successful **production** deployment with known-good
  security headers and content;
- confirm the previous deployment still blocks survey collection and indexing;
- record the reason, incident owner and start time; and
- do not use a preview deployment as a rollback target.

## Dashboard rollback

1. Open the Pages project and select **Deployments**.
2. Locate the known-good production deployment by commit SHA.
3. Use its actions menu and choose **Rollback**.
4. Confirm the target SHA in the confirmation dialog.
5. Verify the production alias now resolves to that deployment.
6. Repeat route, locale, asset, header, `robots.txt`, 404 and no-submission
   checks.
7. Record completion time and evidence.

Cloudflare documents that any successfully built production deployment is a
valid rollback target, while preview deployments are not:
<https://developers.cloudflare.com/pages/configuration/rollbacks/>.

## If dashboard rollback is unavailable

Stop release activity and escalate to the owner. A Git revert and new build is
a separate change that requires review and authorization; do not force-push,
reset or rewrite history. Because the preview stores no response data, this
procedure has no database or data-recovery step.

## Exercise acceptance

- rollback completed from and to recorded immutable SHAs;
- recovery time measured;
- all 21 localized routes and static assets passed;
- CSP and all other required headers passed externally;
- indexing remained disabled;
- no survey endpoint, Function or Worker appeared; and
- incident/release record was retained.

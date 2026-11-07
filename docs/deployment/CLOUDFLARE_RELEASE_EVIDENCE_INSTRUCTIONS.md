# Cloudflare Release A deployment and rollback evidence

These are manual, read-only instructions for the project owner. Cloudflare
presented its human-verification challenge during the AI-assisted check. Do not
bypass it, start a deployment or click **Rollback** while gathering evidence.

## Exact proposed artifact

- Base commit: `a1161628b72e73c8c21e5ab72ed3e46a490534c8`
- Public-source diff SHA-256:
  `90beb48cc020c871eb4ed1d24079b124c78742d8e89ae9edaea31314ca437a24`
- Artifact-tree SHA-256:
  `14bacd6e2cef0bc8b83659e50ce8bd6052824bfaa3f2b8b94cf315a2288ba0df`
- ZIP SHA-256:
  `29498a76030ab61e74b94ed7b1203d83dc87ad33de7930593e3d749274e29d79`

## Open the legitimate project

1. Sign in manually at `https://dash.cloudflare.com/`.
2. Complete the normal Cloudflare human-verification challenge yourself.
3. Open **Workers & Pages** and select the existing `panjab-117` Pages project.
4. Confirm the hostname is `panjab-117.pages.dev` and no paid plan change is
   requested. Stop if the project or hostname differs.
5. Open **Deployments**.

Do not record the account identifier, email, access token, cookies or billing
details.

## Record current production

1. Open the deployment labelled **Production** that currently owns the public
   hostname. Do not retry or promote it.
2. Record its immutable deployment ID. If no ID is labelled, record both the
   exact details URL and immutable deployment-specific `pages.dev` URL.
3. Record status, full source SHA, branch, deployment time, build command and
   output directory.
4. Verify its immutable URL and record whether it remains static and read-only.

## Identify a verified rollback target

1. Locate an earlier **successful production** deployment; do not select a
   preview-branch deployment.
2. Record its immutable ID, exact source SHA, immutable URL and completion
   time.
3. Open the immutable URL and verify the homepage and survey route, root and
   legacy redirects, noindex header, CSP and other security headers, and the
   absence of a survey endpoint, Function or Worker.
4. Record evidence. Do not click **Rollback**.

A listed successful build is not a verified rollback target until its
immutable content and headers have been checked.

## Evidence worksheet

| Field                               | Current production | Verified rollback target |
| ----------------------------------- | ------------------ | ------------------------ |
| Project name                        |                    |                          |
| Environment (`Production`)          |                    |                          |
| Deployment ID                       |                    |                          |
| Deployment-details URL              |                    |                          |
| Immutable deployment URL            |                    |                          |
| Full source SHA                     |                    |                          |
| Source branch                       |                    |                          |
| Status                              |                    |                          |
| Deployment time and timezone        |                    |                          |
| Build command                       |                    |                          |
| Output directory                    |                    |                          |
| Route/header evidence reference     |                    |                          |
| Verified by                         |                    |                          |
| Verification date/time and timezone |                    |                          |

Project owner attestation:

- Name:
- Decision: evidence complete / evidence incomplete
- Date, time and timezone:
- Evidence reference:

Release A remains NO-GO until both columns are complete, the rollback target is
verified and deployment is separately authorized. This does not authorize
Release B.

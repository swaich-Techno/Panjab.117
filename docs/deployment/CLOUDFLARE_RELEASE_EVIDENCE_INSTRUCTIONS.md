# Cloudflare Release A deployment and rollback evidence

These are manual, read-only instructions for the project owner. Cloudflare
presented its human-verification challenge during the AI-assisted check. Do not
bypass it, start a deployment or click **Rollback** while gathering evidence.

## Exact proposed artifact

- Release commit: `58ad5d33251990904de875fb4b02a0c430e1c5fb`
- Artifact inventory: 667 files, 12,113,704 bytes
- Artifact-tree SHA-256:
  `02fabbca564b873726a2cdf3c50feeb322fe6f8784a31f76f62015a2729c3605`
- ZIP: `panjab-117-release-a-final-58ad5d3-02fabbca.zip`
- ZIP SHA-256:
  `47d3b8cfc4c118ca28f6b4b33f8922ad49900bcf980a77905ce191c6a6fd4a4a`

The earlier 60-file archive remains preserved but is superseded and must not be
used as evidence for this candidate.

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

Read-only evidence already obtained from Cloudflare's authenticated GitHub App
integration:

- Current production deployment ID:
  `100d72ea-b09d-4ac6-a24f-e51fdf5a7b78`
- Current production immutable URL:
  `https://100d72ea.panjab-117.pages.dev`
- Current production source:
  `958c4b37a958dafbf7a83324ed350a49d3cf02ad` on
  `feat/step-4c-cloudflare-public-preview`
- Completed: 4 November 2026 at 02:55:12 UTC / 08:25:12 IST
- Evidence: the Cloudflare check record is the only successful record without a
  branch-preview URL, and all seven public production route bodies match the
  immutable deployment byte-for-byte.
- Proposed rollback baseline after a future Release A deployment: the same
  current production deployment ID above.

The current candidate also has automatic **branch-preview** deployment
`b289ab4c-1c10-4b13-be17-6bc44efccf67` at
`https://b289ab4c.panjab-117.pages.dev`. It is not production and is not evidence
of deployment authorization.

The dashboard must still confirm that the current production deployment remains
available as a rollback selection. Do not click **Rollback** while checking.

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

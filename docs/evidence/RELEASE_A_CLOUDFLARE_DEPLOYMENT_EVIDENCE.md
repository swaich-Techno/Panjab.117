# Release A Cloudflare deployment evidence

## Current production

- Project: `panjab-117`
- Public URL: `https://panjab-117.pages.dev`
- Deployment ID: `100d72ea-b09d-4ac6-a24f-e51fdf5a7b78`
- Immutable URL: `https://100d72ea.panjab-117.pages.dev`
- Source commit: `958c4b37a958dafbf7a83324ed350a49d3cf02ad`
- Source branch: `feat/step-4c-cloudflare-public-preview`
- Cloudflare status: successful
- Completed: 4 November 2026 at 02:55:12 UTC / 08:25:12 IST
- GitHub Cloudflare check-run ID: `126357370843`

Cloudflare's authenticated GitHub App supplied the deployment ID, immutable URL,
source SHA, completion status and time. It was the only one of ten successful
branch-head records that did not include a separate branch-preview URL.

The HTML body SHA-256 values for the homepage, four regional pages, Fatehgarh
Sahib overview and Fatehgarh Sahib survey route matched exactly between the
public hostname and the immutable deployment. The immutable root redirects to
`/en/`, missing routes return 404, security/noindex headers are present, and the
survey page contains no form or intake endpoint.

## Current candidate branch preview

- Deployment ID: `b289ab4c-1c10-4b13-be17-6bc44efccf67`
- Immutable URL: `https://b289ab4c.panjab-117.pages.dev`
- Source commit: `58ad5d33251990904de875fb4b02a0c430e1c5fb`
- Source branch: `feat/final-website-design-nov7`
- Completed: 7 November 2026 at 10:36:46 UTC / 16:06:46 IST
- GitHub Cloudflare check-run ID: `128380163872`
- Classification: branch preview, not production

This branch preview was created automatically by the existing Git integration
after the branch push. It is not a production deployment, promotion or separate
release authorization. No Cloudflare mutation was performed during this
evidence stage.

## Rollback evidence

For a future Release A deployment, the current production deployment
`100d72ea-b09d-4ac6-a24f-e51fdf5a7b78` is the proposed last-known-good rollback
baseline. Its immutable content and read-only security boundary have been
verified as described above.

Direct authenticated dashboard confirmation that this deployment remains
selectable for rollback was not obtained. BrowserAct failed at its installed
`uv` trampoline, and the available Windows browser-control bridge required a
newer Node host than the installed version. Web access did not expose the
authenticated dashboard session. No CAPTCHA or security challenge was bypassed.

The rollback gate therefore remains pending. No distinct earlier production
deployment was identified from the ten available successful Cloudflare
branch-head records; the other nine were explicitly branch previews.

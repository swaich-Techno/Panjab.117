# English-only site review

Status: engineering implementation complete; independent English content,
accessibility and legal review pending.

## Public route inventory

Only these seven static routes are generated:

- `/en/`
- `/en/regions/majha/`
- `/en/regions/malwa/`
- `/en/regions/doaba/`
- `/en/regions/puadh/`
- `/en/fatehgarh-sahib/`
- `/en/fatehgarh-sahib/survey/`

`/` redirects temporarily to `/en/`. Cloudflare Pages redirects `/pa/` and
`/hi/`, including nested paths, to the corresponding English path. The
language selector is absent, public static parameters contain only `en`,
`<html lang="en">` is required, and Punjabi/Hindi alternate metadata is
absent. Historical translation work remains in Git history; this branch does
not claim language equivalence.

## Content findings

- The survey page says that collection is unavailable and approval-gated.
- The preview uses component state only; it has no form submission, storage or
  network request.
- Eligibility now says 18 or older, current residence in exactly one listed
  Assembly segment, and self-submission.
- Political-opinion questions remain optional and appear only after a separate
  choice.
- The target notice identifies 500 as a minimum operational goal, not a cap,
  representative sample, opinion poll or prediction.
- English-only recruitment can exclude residents who cannot comfortably read
  English. Every future report must disclose that coverage bias.

## Human review still required

An actual reviewer must record their name, relevant proficiency, materials,
corrections, decision and review time. Required materials include the homepage,
regional pages, Fatehgarh Sahib page, questionnaire, eligibility statement,
consent notice, political-consent choice, withdrawal wording, target notice,
navigation, metadata and redirect destinations. No review decision is inferred
from this engineering review.

# Website corrections prepared locally

## Why a patch is needed

The live static site is safely read-only and already defaults to English, but it uses an imprecise nine-seat heading and displays an elapsed proposed participation window. The local correction retains the English-first language order while fixing those potentially confusing details.

## Minimal static corrections

- locale priority and root redirect: English, Punjabi, Hindi (`en`, `pa`, `hi`);
- accurate heading: “Fatehgarh Sahib Parliamentary Constituency — Nine Assembly Segments”;
- explicit distinction between Fatehgarh Sahib district (54, 55, 56) and the wider parliamentary constituency (54, 55, 56, 57, 58, 59, 67, 69, 106);
- removed 5–15 November dates from public survey-preview UI;
- replacement wording says dates will be confirmed only after privacy, security, consent, backup and operational approval;
- survey preview remains unavailable, read-only and form-free;
- mobile header, navigation, title wrapping and language-control focus are strengthened;
- static-export tests enforce the English redirect and absence of obsolete dates.

The Punjabi and Hindi corrections are editor drafts, not independently verified translations. They must be approved by named human reviewers before public promotion.

## Deliberately unchanged

- all 117 constituency records and the nine official IDs;
- static-only Cloudflare architecture and security headers;
- search-indexing prohibition;
- survey, operational and final-launch approvals;
- absence of API, database, persistent storage, analytics and AI;
- existing production deployment.

## Branding limitation

No image/logo asset exists in the static repository (`public` contains only `_headers` and `_redirects`). The social package therefore supplies exact content and layout specifications but does not fabricate a logo. Aman must use the separately held, approved Panjab 117 logo file and record its source/version.

## Deployment status

Prepared and locally verified only. Not staged, committed, pushed or deployed.

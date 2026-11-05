# Independent human-review status

No reviewer identity, signature, approval or date has been fabricated. Every required independent approval remains pending.

## Review record template

Each reviewer must supply: name, organization/qualification, conflict declaration, exact scope/version, findings, required changes, decision, date/time with timezone and durable evidence reference.

## Exact public-preview language review package

Reviewers must inspect the rendered pages and the source materials below. Approval of this public-preview wording does not approve genuine survey collection.

### Rendered routes

After running `npm run build:cloudflare` and `npm run preview:static`, inspect these routes at 320 px, 375 px, 768 px and desktop width:

| Language | Homepage | Parliamentary constituency | Read-only survey preview      |
| -------- | -------- | -------------------------- | ----------------------------- |
| Punjabi  | `/pa/`   | `/pa/fatehgarh-sahib/`     | `/pa/fatehgarh-sahib/survey/` |
| Hindi    | `/hi/`   | `/hi/fatehgarh-sahib/`     | `/hi/fatehgarh-sahib/survey/` |

For each route, review the page title, navigation, language selector, geographic description, unavailable-status notice, approval warning, question wording, answer options, consent/privacy wording, validation text, receipt/withdrawal explanation and footer. Confirm that Punjabi is first, Hindi second and English third in the selector.

### Exact source and publication materials

| Material                                              | What must be reviewed                                                                                          |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `src/lib/translations.ts`                             | Homepage navigation, project introduction, privacy/contact placeholders and language labels                    |
| `src/lib/regional-translations.ts`                    | District-versus-parliamentary distinction, all Fatehgarh Sahib headings and every no-collection/status message |
| `src/lib/survey/preview-translations.ts`              | Preview instructions, validation/error wording, receipt and withdrawal messages                                |
| `src/lib/survey/consent.ts`                           | Consent, voluntary participation, political-opinion warning, privacy and withdrawal text                       |
| `src/lib/survey/questionnaire.ts`                     | Every question, help text and answer option shown in the read-only preview                                     |
| `docs/launch/2026-11-05/LAUNCH_CAPTIONS_PA_EN_HI.md`  | Captions, schedule correction, WhatsApp/Facebook copy, press release, pinned comment and FAQ                   |
| `docs/launch/2026-11-05/INSTAGRAM_FACEBOOK_ASSETS.md` | Headline, carousel text and alt text                                                                           |
| `docs/launch/2026-11-05/REEL_AND_STORY_PROMPTS.md`    | Reel overlays, Story copy and no-collection warning                                                            |
| `docs/launch/2026-11-05/TEAM_TASKS_6PM.md`            | Messages intended for Aman, Lovejot and Simran                                                                 |

### Punjabi reviewer record — uncompleted

- Reviewer name:
- Punjabi proficiency/role:
- Conflict declaration:
- Commit or source version reviewed:
- Rendered routes reviewed:
- Materials reviewed:
- Findings and corrections:
- Decision (`approved`, `approved after listed corrections`, or `rejected`):
- Review date/time and timezone:
- Evidence reference:

### Hindi reviewer record — uncompleted

- Reviewer name:
- Hindi proficiency/role:
- Conflict declaration:
- Commit or source version reviewed:
- Rendered routes reviewed:
- Materials reviewed:
- Findings and corrections:
- Decision (`approved`, `approved after listed corrections`, or `rejected`):
- Review date/time and timezone:
- Evidence reference:

Blank fields are intentionally not evidence. A qualified project member may complete a public-preview review only after actually inspecting every listed item. Legal, privacy and survey-language approval for genuine collection remains a separate gate.

## Legal and privacy — pending

Reviewer must determine the applicable Indian law and timing, including phased DPDP Act/Rules, CERT-In obligations and any election-period restrictions. The review must cover responsible entity, purpose/legal basis, ordinary and separate political-opinion consent, age eligibility, withdrawal/complaints, minimization, retention, security, processors/subprocessors, incidents and publication restrictions.

Materials: [Step 5E independent review pack](https://github.com/swaich-Techno/Panjab.117/blob/eedd89587635a60faf1cc7ee67ee60069cfbbc54/docs/review/STEP_5E_INDEPENDENT_REVIEW_PACK.md), [privacy/legal sheet](https://github.com/swaich-Techno/Panjab.117/blob/eedd89587635a60faf1cc7ee67ee60069cfbbc54/docs/review/PRIVACY_LEGAL_REVIEW.md).

## Punjabi review — pending

Review every Punjabi survey question, answer option, consent/privacy message, validation error, receipt, withdrawal instruction and launch announcement. Confirm meaning, neutrality, Gurmukhi readability, age/consent meaning, geographic distinction and that no text implies collection is open.

Materials: [Punjabi linguistic sheet](https://github.com/swaich-Techno/Panjab.117/blob/eedd89587635a60faf1cc7ee67ee60069cfbbc54/docs/review/PUNJABI_LINGUISTIC_REVIEW.md) plus [today’s captions](./LAUNCH_CAPTIONS_PA_EN_HI.md) and local website diff.

## Hindi review — pending

Apply the same line-by-line review to Hindi, including terminology for parliamentary constituency/Assembly segment and participation postponement.

Materials: [Hindi linguistic sheet](https://github.com/swaich-Techno/Panjab.117/blob/eedd89587635a60faf1cc7ee67ee60069cfbbc54/docs/review/HINDI_LINGUISTIC_REVIEW.md) plus [today’s captions](./LAUNCH_CAPTIONS_PA_EN_HI.md) and local website diff.

## Methodology — pending

Confirm voluntary recruitment, neutral questions, separate consent, duplicate-review policy, withdrawal treatment, disclosure protection and claims. Any future results must describe self-selection and must not be presented as representative voter estimates without a defensible sampling design.

Material: [survey methodology sheet](https://github.com/swaich-Techno/Panjab.117/blob/eedd89587635a60faf1cc7ee67ee60069cfbbc54/docs/review/SURVEY_METHODOLOGY_REVIEW.md).

## Accessibility — pending

Automated tests and exact-width Chrome checks provide partial evidence. A human must test keyboard order/visibility, 200% and 400% zoom/reflow, Punjabi and Hindi reading, contrast, errors/instructions, mobile assistive technology and at least one supported screen reader. No screen-reader pass is claimed.

Material: [accessibility sheet](https://github.com/swaich-Techno/Panjab.117/blob/eedd89587635a60faf1cc7ee67ee60069cfbbc54/docs/review/ACCESSIBILITY_REVIEW.md).

## Security — pending

An independent reviewer must assess the threat model, production topology, TLS/private networking, KMS separation/custody, IdP/MFA, privileges, approval signatures, audit/outbox, retention cleanup, receipt recovery, backups/PITR, suppression replay, monitoring, incident response, emergency stop and release rollback. Penetration testing must use an authorized staging target and synthetic data; no intrusive public-system test is authorized.

## Sign-off rule

Findings must be resolved and evidence linked. A checkbox, test fixture, synthetic signature or Boolean override cannot satisfy an approval gate.

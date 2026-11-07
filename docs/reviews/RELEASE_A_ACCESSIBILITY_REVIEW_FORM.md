# Release A accessibility human review form

Complete this form only after personally testing the exact checksum-matched
candidate. Engineering automation and accessibility-tree inspection are not a
substitute for a human assistive-technology review.

## Fixed candidate identity

- Base commit: `a1161628b72e73c8c21e5ab72ed3e46a490534c8`
- Branch: `feat/release-a-content-accessibility-remediation`
- Public-source diff SHA-256:
  `90beb48cc020c871eb4ed1d24079b124c78742d8e89ae9edaea31314ca437a24`
- Artifact-tree SHA-256:
  `14bacd6e2cef0bc8b83659e50ce8bd6052824bfaa3f2b8b94cf315a2288ba0df`
- Artifact inventory: 60 files, 1,321,571 bytes
- ZIP SHA-256:
  `29498a76030ab61e74b94ed7b1203d83dc87ad33de7930593e3d749274e29d79`
- Review target: English-only static Release A

## Reviewer record

- Reviewer name:
- Role or relationship to Panjab 117:
- Relevant accessibility competence or lived experience:
- Conflict of interest declaration:
- Standards or methods used:
- Browser, operating system and versions:
- Assistive technology and version, if used:
- Mobile device or emulated viewport tested:
- Review environment URL:
- Artifact checksum independently confirmed: yes / no
- Review started (date, time and timezone):
- Review completed (date, time and timezone):
- Evidence reference (notes, issue, screenshots or recording):

## Exact seven public URLs

1. `https://panjab-117.pages.dev/en/`
2. `https://panjab-117.pages.dev/en/regions/majha/`
3. `https://panjab-117.pages.dev/en/regions/malwa/`
4. `https://panjab-117.pages.dev/en/regions/doaba/`
5. `https://panjab-117.pages.dev/en/regions/puadh/`
6. `https://panjab-117.pages.dev/en/fatehgarh-sahib/`
7. `https://panjab-117.pages.dev/en/fatehgarh-sahib/survey/`

## Reviewer responsibilities

Test and record:

- keyboard-only access, logical tab order, skip link and visible focus;
- all navigation, region-directory search and survey-preview controls without
  a pointer;
- question-to-question and backward focus, progress announcements and
  validation alerts;
- titles, English document language, headings, landmarks, lists, labels,
  instructions and status messages;
- mobile layout, target size and reflow at 320, 375/390, 768 and 1440 CSS
  pixels;
- actual 200% and 400% zoom or equivalent reflow, identifying the exact method;
- colour contrast, non-colour status cues and forced-colour/high-contrast mode
  where available;
- reduced-motion behavior;
- screen-reader output if actually tested, naming the software and version;
- redirects, route changes, back navigation, anchors and fallback behavior; and
- whether any issue obscures the survey's read-only status.

## Findings and corrections

| URL or component | Test method | Finding | Severity | Required correction | Evidence reference |
| ---------------- | ----------- | ------- | -------- | ------------------- | ------------------ |
|                  |             |         |          |                     |                    |

Unresolved findings:

## Decision

Select exactly one:

- [ ] **APPROVE** this exact source diff and artifact for Release A.
- [ ] **REJECT** this exact source diff and artifact.
- [ ] **REVIEW INCOMPLETE**; no release decision is supplied.

Decision rationale:

Reviewer attestation: I performed the tests recorded above. This record does
not claim complete WCAG conformance and does not approve Release B.

- Reviewer name:
- Date, time and timezone:
- Signature or verifiable approval reference:

Any correction creates a new candidate and requires a new build, checksum and
review.

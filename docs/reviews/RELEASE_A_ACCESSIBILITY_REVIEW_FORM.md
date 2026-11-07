# Release A accessibility human review form

Complete this form only after personally testing the exact checksum-matched
candidate. Engineering automation and accessibility-tree inspection are not a
substitute for a human assistive-technology review.

## Fixed candidate identity

- Source commit: `58ad5d33251990904de875fb4b02a0c430e1c5fb`
- Source branch: `feat/final-website-design-nov7`
- Frozen artifact: `panjab-117-release-a-final-58ad5d3-02fabbca`
- Artifact-tree SHA-256:
  `02fabbca564b873726a2cdf3c50feeb322fe6f8784a31f76f62015a2729c3605`
- Artifact inventory: 667 files, 12,113,704 bytes
- ZIP SHA-256:
  `47d3b8cfc4c118ca28f6b4b33f8922ad49900bcf980a77905ce191c6a6fd4a4a`
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

## Exact seven candidate URLs

Use the locally served checksum-matched archive or the recorded immutable
branch preview below. The main production host serves an older release and is
not the candidate under review.

1. `https://b289ab4c.panjab-117.pages.dev/en/`
2. `https://b289ab4c.panjab-117.pages.dev/en/regions/majha/`
3. `https://b289ab4c.panjab-117.pages.dev/en/regions/malwa/`
4. `https://b289ab4c.panjab-117.pages.dev/en/regions/doaba/`
5. `https://b289ab4c.panjab-117.pages.dev/en/regions/puadh/`
6. `https://b289ab4c.panjab-117.pages.dev/en/fatehgarh-sahib/`
7. `https://b289ab4c.panjab-117.pages.dev/en/fatehgarh-sahib/survey/`

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

- [ ] **APPROVE** this exact source commit and artifact for Release A.
- [ ] **REJECT** this exact source commit and artifact.
- [ ] **REVIEW INCOMPLETE**; no release decision is supplied.

Decision rationale:

Reviewer attestation: I performed the tests recorded above. This record does
not claim complete WCAG conformance and does not approve Release B.

- Reviewer name:
- Date, time and timezone:
- Signature or verifiable approval reference:

Any correction creates a new candidate and requires a new build, checksum and
review.

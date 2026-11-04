# Accessibility review packet

- Status: **review not completed**
- Target: read-only public site and in-memory survey preview
- Languages: English, Punjabi (Gurmukhi), Hindi (Devanagari)

## Flows to test

1. skip link to the main landmark;
2. header navigation and language switching while retaining route context;
3. homepage links to four cultural-region directories;
4. directory search, results announcement and clear-search action;
5. Fatehgarh Sahib nine-segment page and external source link;
6. consent disclosure, required civic consent and optional political consent;
7. single- and multiple-choice questions, optional skip, back/next and restart;
8. validation error announcement and progress indicator; and
9. 200%/400% zoom, narrow mobile viewport, landscape and reduced motion.

## Test matrix

| Area           | Required evidence                                                   |
| -------------- | ------------------------------------------------------------------- |
| keyboard       | logical focus order, visible focus, no trap, all actions operable   |
| semantics      | landmarks, headings, labels, fieldsets/legends, button names        |
| screen readers | at least one Windows and one mobile combination                     |
| language       | correct document `lang`; intelligible pronunciation in all locales  |
| reflow         | no two-dimensional scrolling at 320 CSS px except essential content |
| contrast       | text, controls, focus and status meet approved WCAG target          |
| errors         | announced, specific and preserved without coercion                  |
| consent        | no preselection, equal decline path, optional questions skippable   |
| motion         | transitions respect reduced-motion preference                       |
| touch          | adequate target size and spacing on representative phones           |

## Current local evidence and limitations

Semantic HTML, native inputs, fieldsets/legends, labels, a skip link, focus
styles, live validation regions and reduced-motion classes are present. Local
lint/build and structural review cannot prove screen-reader behavior, visual
reflow, contrast under real rendering or touch ergonomics. The BrowserAct audit
could not run because its CLI and required installer are absent; no installation
was authorized. These remain public-preview launch blockers.

Exact language text for review is in:

- `PUNJABI_LINGUISTIC_REVIEW.md`
- `HINDI_LINGUISTIC_REVIEW.md`
- `PRIVACY_LEGAL_REVIEW.md`
- `SURVEY_METHODOLOGY_REVIEW.md`

## Reviewer record

- Reviewer name/credentials: _not provided_
- Assistive technologies and versions: _not provided_
- Devices/viewports: _not provided_
- Findings/evidence: _not provided_
- Decision: _not reviewed_

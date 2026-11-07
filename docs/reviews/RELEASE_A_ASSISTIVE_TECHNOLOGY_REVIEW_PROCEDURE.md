# Release A assistive-technology review procedure

This procedure must be completed by a genuine human reviewer. Automated and
AI-assisted checks are supporting evidence, not a human accessibility decision.

## Fixed candidate

- Commit: `58ad5d33251990904de875fb4b02a0c430e1c5fb`
- Artifact-tree SHA-256:
  `02fabbca564b873726a2cdf3c50feeb322fe6f8784a31f76f62015a2729c3605`
- ZIP SHA-256:
  `47d3b8cfc4c118ca28f6b4b33f8922ad49900bcf980a77905ce191c6a6fd4a4a`

## Reviewer record

Record the reviewer's genuine name, relationship to Panjab 117, relevant
assistive-technology experience, conflicts, device, operating system, browser,
assistive technology and exact versions. Record start/completion times and an
evidence reference. Do not infer qualifications or signatures.

## Minimum procedure

Use a genuinely available screen reader, such as NVDA with Chrome or Firefox,
or Narrator with Edge. Also complete keyboard-only and 200% zoom/reflow checks.

1. Verify the skip link, page title, language, landmarks and heading order on
   the homepage.
2. Search and filter the constituency directory; confirm result-count updates,
   card names, numbers, reserved status and profile links are understandable.
3. Open one region page, two constituency profiles and the Fatehgarh Sahib
   page; confirm the nine Assembly-segment cards and district/parliamentary
   distinction.
4. Complete all eight survey-preview screens using only the keyboard. Verify
   labels, fieldsets, required-state errors, progress announcements, focus after
   Continue/Back/Edit, optional political-opinion wording and the explicit
   no-submission completion state.
5. At 200% zoom and a 320-pixel reflow width, confirm no content, focus target
   or control is obscured and the mobile menu remains operable.
6. Verify visible focus and reduced-motion behavior. Record any screen-reader
   verbosity, reading-order, naming, contrast or touch-target concern.

## Decision

List every route and screen actually reviewed, findings, severity, corrections
and evidence. Select exactly one decision: **approve**, **reject**, or **review
incomplete**. Any content or code correction creates a new candidate requiring
a new build and checksum. This review cannot authorize genuine survey
collection.

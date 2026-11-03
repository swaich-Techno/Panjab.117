# Regional classification dataset

Status: **complete proposal; human review required for every assignment**  
Last source review: 2026-11-03  
Machine-readable dataset: `src/data/constituencies.ts`

## What is authoritative

The constituency number, English name and Scheduled Caste reservation marker are transcribed from Election Commission of India Delimitation Order No. 22. That order defines the 117 Punjab Assembly constituencies and their electoral extent. The application tests that the dataset contains exactly one record for every number from 1 through 117.

Primary source: [ECI archive of delimitation orders](https://www.eci.gov.in/146-archive-delimitation-orders), Punjab Order No. 22.

## What is provisional

The `proposedRegion` field is an editorial discovery aid. It is **not** an ECI field, an administrative boundary, or a verified fact about every locality inside an Assembly constituency. Every record is deliberately marked `human_review_required`.

The current complete proposal uses these review groups:

| Proposed region | Assembly constituency numbers | Count |
| --------------- | ----------------------------- | ----: |
| Majha           | 1–25                          |    25 |
| Doaba           | 26–48                         |    23 |
| Puadh           | 49–56 and 109–117             |    17 |
| Malwa           | 57–108                        |    52 |

These ranges are not represented as official boundaries. They provide a transparent starting point so reviewers can identify and correct disputed edges rather than leaving a partial map that appears verified.

## Why review is necessary

- The [Government of Punjab overview](https://punjab.gov.in/know-punjab/) describes Punjab using three regions: Majha, Doaba and Malwa.
- The [PUDA Greater Mohali Regional Plan 2008–2058](https://puda.punjab.gov.in/sites/default/files/Regional_rpt_2011.pdf) describes four natural regions, including Puadh, and states that Greater Mohali straddles regions and sub-regions.
- Cultural regions do not follow ECI constituency boundaries. An Assembly constituency can contain communities with different regional identities.
- The proposed Puadh edges, especially constituencies 49–56 and 109–117, need review by regional historians, Punjabi-language editors and people with local knowledge. Adjacent Malwa assignments should be reviewed at the same time.

## Publication rule

The UI labels every regional count as provisional and shows a human-review warning. A future change may mark an individual classification verified only after a reviewer records:

1. the evidence used;
2. the geographic scope of the claim;
3. reviewer identity and review date;
4. any dissent or boundary ambiguity; and
5. a versioned change record.

The official Fatehgarh Sahib parliamentary grouping is stored separately and must never be inferred from this cultural classification.

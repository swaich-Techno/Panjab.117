# Step 4A questionnaire specification

Status: **development preview only; survey intake disabled**

- Questionnaire ID: `fatehgarh-sahib-civic-survey`
- Version: `fatehgarh-sahib-civic-2026-11-draft-1`
- Consent version: `fatehgarh-sahib-consent-2026-11-draft-1`
- Proposed window: 5–15 November 2026, Asia/Kolkata
- Sampling claim: voluntary responses only; not representative polling
- Translation status: Punjabi and Hindi require human linguistic and legal review

The proposed dates do not activate collection. The launch, production-security,
privacy, consent, backup/recovery and operations approvals remain false.

## Population and Assembly segments

The preview includes the nine segments in the existing source-attributed
Fatehgarh Sahib parliamentary grouping:

1. 54 Bassi Pathana (SC)
2. 55 Fatehgarh Sahib
3. 56 Amloh
4. 57 Khanna
5. 58 Samrala
6. 59 Sahnewal
7. 67 Payal (SC)
8. 69 Raikot (SC)
9. 106 Amargarh

The segment question asks where the participant lives or which area they know
best. It must not be presented as proof of residence or voter eligibility.

## Questionnaire structure

| ID                              | Section            | Required | Response          | Construct                                            |
| ------------------------------- | ------------------ | -------- | ----------------- | ---------------------------------------------------- |
| `assembly_segment`              | location           | yes      | single choice     | selected/known Assembly segment                      |
| `local_infrastructure`          | civic              | no       | five-point rating | overall local infrastructure                         |
| `roads_transport`               | civic              | no       | five-point rating | roads and public transport                           |
| `healthcare_access`             | civic              | no       | five-point rating | access to healthcare                                 |
| `education_access`              | civic              | no       | five-point rating | education and skills training                        |
| `employment_opportunities`      | civic              | no       | five-point rating | local employment opportunities                       |
| `agriculture_livelihoods`       | civic              | no       | five-point rating | support for agriculture and local livelihoods        |
| `public_services`               | civic              | no       | five-point rating | access to everyday public services                   |
| `community_priority`            | civic              | no       | single choice     | one issue that should receive most local attention   |
| `representative_responsiveness` | political optional | no       | five-point rating | perceived responsiveness of elected representatives  |
| `public_decision_factors`       | political optional | no       | up to three       | public issues used to assess elected representatives |

The exact English, Punjabi and Hindi prompts and options are version-controlled
in `src/lib/survey/questionnaire.ts`. Tests require every question and option to
contain all three locales and verify the exact nine segment numbers.

## Neutrality and skip rules

- Ratings use balanced labels from very good to very poor.
- Civic questions are optional except the segment selection needed for the
  preview flow. Every optional question has a visible skip action.
- “Prefer not to answer” is available on rating and priority questions.
- Agriculture includes “Not applicable to me.”
- No party, candidate, voting intention, campaign message or preferred winner
  is named or inferred.
- Political-opinion questions are kept in a separate section and are shown only
  after affirmative, unbundled political-opinion consent.
- Declining political-opinion consent does not prevent completion of the civic
  path.
- The prototype avoids free text to reduce accidental collection of names,
  contact details, allegations and other identifying information.

## Preview behavior

`src/components/survey-preview.tsx` is an in-memory Client Component. It provides
a progress indicator, back/next controls, explicit skips, keyboard-native
controls and live validation messages. It has no submit button, route handler,
server action, storage API, analytics call or persistence mechanism. Refreshing
or restarting discards the local preview state.

## Required review before any launch

- cognitive interviews across languages and literacy levels;
- native Punjabi and Hindi linguistic review;
- legal/privacy review of notices and political-opinion processing;
- accessibility testing with screen readers and mobile zoom;
- survey-methodology review of question order, measurement validity, sampling,
  weighting and non-response bias; and
- approval of the exact version digest so deployed text cannot drift from the
  recorded consent version.

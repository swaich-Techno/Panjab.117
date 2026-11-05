# Party-registration and candidate-directory prototype

## Scope

This branch is a local, synthetic-only design for a possible registration pilot across the nine Assembly segments of the Fatehgarh Sahib Parliamentary Constituency. It is based on the verified English-first website checkpoint.

It does not enable public registration, genuine survey collection, a production database, an API, external AI or deployment. A synthetic category selection is not party membership, a party application, a formal candidacy or an Election Commission nomination. Final launch approval and all five operational approvals remain false. The public Cloudflare Pages site is unchanged.

## Supported top-level categories

| ID                 | Display name                   | Prototype status | Capacity scope                             |
| ------------------ | ------------------------------ | ---------------- | ------------------------------------------ |
| `sad`              | Shiromani Akali Dal            | active           | 100 across the nine-segment pilot          |
| `inc`              | Indian National Congress       | active           | 100 across the nine-segment pilot          |
| `aap`              | Aam Aadmi Party                | active           | 100 across the nine-segment pilot          |
| `ad_wpd`           | Akali Dal (Waris Punjab De)    | active category  | 100 across the nine-segment pilot          |
| `others`           | Other parties and independents | active           | 100 shared across all specific sub-options |
| `bjp_sad_alliance` | Proposed BJP–SAD alliance      | disabled         | no capacity while disabled                 |

`ad_wpd` is labeled as a political organisation whose ECI party-registration status has not been verified. The prototype does not describe it as an ECI-registered party.

The `others` category requires a specific choice: Bharatiya Janata Party, Bahujan Samaj Party, Shiromani Akali Dal (Amritsar), Independent or Other party not listed. BJP remains selectable here because no formal BJP–SAD alliance has been verified.

`Undecided`, `None` and `Prefer not to say` are reserved for optional political-opinion questions. They are not party registrations and do not consume registration capacity.

## Alliance rule

The proposed BJP–SAD category is fail-closed. [The New Indian Express reported speculation and possible talks on 2 November 2026](https://www.newindianexpress.com/amp/story/india/2026/Nov/02/amit-shahs-nda-push-fuels-speculation-of-bjp-sad-reunion-for-2027-punjab-polls), while [The Indian Express had reported a BJP statement that it intended to contest all 117 seats separately](https://indianexpress.com/article/political-pulse/punjab-elections-2027-bjp-contest-all-117-seats-solo-bl-santhosh-rules-out-sad-alliance-10847576/lite/). No formal alliance announcement or constituency-wise agreement was verified as of 5 November 2026.

Enabling the alliance later requires all of the following:

1. an attributable formal announcement from both organisations;
2. administrator review of the source and date;
3. constituency-wise review of the nine pilot segments;
4. a new versioned category record and tests;
5. privacy/methodology review of how separate and alliance registrations are reported.

Historical SAD or BJP selections must never be migrated automatically. Separate and alliance counts must never be combined into a misleading total.

## Prototype route

The local static route is:

`/{locale}/fatehgarh-sahib/registration-preview/`

It is generated for English, Punjabi and Hindi. English is first/default. Punjabi and Hindi are editor drafts pending named human review.

The browser component stores selections only in React memory. It has no HTML submission form, API, fetch/XHR request, cookie, local storage or session storage. The confirmation is visibly synthetic and is not a receipt.

## Neutrality

The category order is an approved product requirement, not a ranking or endorsement. Candidate names appear only where the candidate source register records an announcement. Missing combinations display “Candidate not yet announced.” The prototype makes no support, vote-share, popularity or election-outcome claim.

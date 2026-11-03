# Step 4A production-readiness gaps

Step 4A is a design milestone, not production approval. The interactive preview
holds selections only in React memory and has no endpoint, server action,
database, production credentials or external integration.

## Implemented as synthetic design evidence

- versioned neutral questionnaire for all nine Fatehgarh Sahib Assembly segments;
- English, Punjabi and Hindi prompts and consent drafts;
- separate optional political-opinion consent;
- accessible preview navigation, progress and validation;
- consent-version and synthetic withdrawal models;
- HMAC-based, rotation-aware atomic duplicate-screening interface;
- concurrent replay and survey-version isolation tests;
- segment totals, missing values, valid denominators and duplicate exclusions;
- primary and complementary small-cell suppression; and
- survey-intake threat model and residual-risk register.

## Production blockers

1. **Governance and law:** approve Data Fiduciary identity, lawful basis,
   participant/age policy, notices, rights process, retention and complaint route.
2. **Language:** independent native Punjabi and Hindi legal/linguistic review;
   user comprehension testing; accessible alternative formats.
3. **Survey method:** sampling frame, recruitment, non-response plan, weighting,
   instrument validation, bias assessment and publication protocol.
4. **Application security:** production identity/session design, CSRF, schema
   validation, bounded request parser, CSP, abuse controls and security testing.
5. **Data security:** approved private database, managed keys, TLS, credential
   rotation, least privilege, immutable audit export and logging canaries.
6. **Atomic stores:** durable idempotency, duplicate signal and rate-limit stores
   with transaction, contention, expiry and failure-injection evidence.
7. **Privacy operations:** verified contact channel, withdrawal SLA, proportional
   verification, deletion jobs, appeal workflow and backup-ledger replay.
8. **Disclosure control:** approved small-cell threshold, complementary rules,
   linkage review, analyst access boundary and release sign-off.
9. **Reliability:** load/capacity tests, monitoring, incident response, encrypted
   backup restore, deletion recovery and accepted RPO/RTO.
10. **Deployment:** reviewed provider contracts, regions, sub-processors, DNS,
    WAF/cache rules, origin restrictions and rollback plan.

The proposed 5 November opening date cannot waive any blocker. Until every
operational approval is independently set true after evidence review, the survey
must remain unavailable.

## Explicit exclusions

- no live submission or route handler;
- no database or cloud provisioning;
- no production credentials or real participant data;
- no external AI provider, analytics, fingerprinting or paid service;
- no election prediction, candidate preference or fabricated finding; and
- no deployment, commit, push or merge in this implementation task.

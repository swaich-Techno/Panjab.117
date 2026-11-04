# Step 5C privacy and launch checklist

This checklist is fail-closed. A target date, local test or environment flag
cannot substitute for signed evidence.

## Current approvals

| Approval            | Approved | Owner                                 | Evidence |
| ------------------- | -------- | ------------------------------------- | -------- |
| Production security | `false`  | security owner + independent reviewer | none     |
| Privacy             | `false`  | qualified privacy/legal reviewer      | none     |
| Consent             | `false`  | legal + Punjabi/Hindi reviewers       | none     |
| Backup and recovery | `false`  | recovery and privacy owners           | none     |
| Operations          | `false`  | operations owner                      | none     |
| Final survey launch | `false`  | accountable project owner             | none     |

## Privacy and methodology

- [ ] Confirm Data Fiduciary/processor roles, lawful purpose and current DPDP
      Act/Rules position with qualified Indian counsel.
- [ ] Approve concise notices, voluntary participation, separate political
      consent, withdrawal limits, grievance route and a real privacy contact.
- [ ] Approve the minimum-age policy; current 18+ rule remains a draft.
- [ ] Approve Punjabi and Hindi wording after native review and cognitive tests.
- [ ] Approve purpose-specific response, screening, log, key and backup
      retention periods and automated destruction evidence.
- [ ] Preregister recruitment, exclusions, denominators, missing data,
      uncertainty and disclosure control. Never claim a voluntary online sample
      represents the electorate.
- [ ] Prohibit individual political responses, raw comments, sparse cells,
      candidate rankings and election predictions.

## Security and recovery

- [ ] Independently review the threat model and close penetration-test findings.
- [ ] Verify TLS/WAF, exact Origin, CSRF, request limit, egress denial and safe
      errors against the staging deployment.
- [ ] Verify phishing-resistant MFA, named/JIT roles, key separation, secret
      rotation, tamper-evident audit and tested break-glass access.
- [ ] Run current migrations and all MySQL security tests on the exact staging
      engine; prove HA/failure, PITR, quarantine restore and deletion replay.
- [ ] Prove an atomic durable audit/outbox path and approve a safe recovery
      process for an accepted submission whose one-time receipt response is
      lost, without storing recoverable receipt plaintext.
- [ ] Confirm no answer data reaches logs, analytics, URLs, browser persistence,
      crash reports or AI services.

## Accessibility and operations

- [ ] Independently test keyboard, Windows/mobile screen readers, focus,
      errors, 320 px reflow, 200%/400% zoom, contrast and reduced motion in all
      three languages.
- [ ] Assign 24×7 security, privacy, operations and provider contacts for the
      collection window; approve incident and notification templates.
- [ ] Complete load/capacity tests, alert delivery, budget alerts, kill switch,
      rollback and maintenance/change-freeze exercises.

## Evidence record

Every approval needs an immutable ID, exact scope, commit and image digest,
questionnaire/notice digest, signer from the approved IdP, decision, conditions,
time, expiry, revocation and supersession. Six current records are required.

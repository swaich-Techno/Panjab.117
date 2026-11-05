# Step 5D live-collection gate

All items are fail-closed. Completion of code or synthetic tests does not approve collection.

- [ ] Production launch approval is signed, current, unrevoked and release-bound.
- [ ] Security approval is independently signed.
- [ ] Privacy/legal approval is independently signed.
- [ ] Consent and Punjabi/Hindi language approval is independently signed.
- [ ] Methodology approval is independently signed.
- [ ] Operations, backup and incident-response approval is independently signed.
- [ ] Managed MySQL, private networking, TLS, KMS and secrets are provisioned and reviewed.
- [ ] Disposable and production-like MySQL recovery tests pass.
- [ ] Audit outbox backlog and dead-letter alerts are exercised.
- [ ] Backup restore quarantine and deletion-ledger replay are witnessed.
- [ ] Administrator MFA, least privilege, break-glass and audit review are witnessed.
- [ ] Retention policy and cleanup schedule are approved.
- [ ] Independent mobile, keyboard, screen-reader and multilingual reviews are complete.
- [ ] Incident contacts, withdrawal support and pause/rollback procedures are staffed.
- [ ] A final go/no-go record names the exact commit and image digest.

Current state: launch approval and all five operational approvals are false. AI is disabled. Live submission remains disabled.

## Cost boundary

A zero-cost setup is unsuitable for confidential political-opinion intake because it does not establish managed recovery, KMS separation, private networking, monitored backups, MFA operations or contractual support. Local synthetic tests and the read-only static preview can remain free. Minimum production budgeting must include a private application service, managed MySQL with PITR, two separated KMS key domains, encrypted backups, monitoring/alerting, network egress and independent reviews. Pricing must be refreshed and approved before procurement; no paid resource is authorized by Step 5D.

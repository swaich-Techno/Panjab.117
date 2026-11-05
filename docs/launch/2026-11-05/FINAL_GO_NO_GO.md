# Final GO / NO-GO

Status date: 5 November 2026, Asia/Kolkata. This decision applies to the evidence available in the isolated local worktree; nothing was deployed or published.

## Decision A — public project and survey-preview announcement

**Current decision: NO-GO for publishing the full branded announcement.**

The local static correction is technically verified, but it has not been committed, pushed or deployed. The current live site still defaults to English and displays the old proposed dates. Punjabi/Hindi launch copy has no named human approval, and the repository does not contain the approved logo needed to finish and verify the requested social artwork.

The decision becomes **GO** only after all of these are evidenced:

1. project lead approves the exact caption and accurate scope;
2. named Punjabi and Hindi reviewers approve the public wording;
3. Aman produces the final assets using the approved logo, alt text and “responses not yet accepted” notice;
4. a separately authorized static release is deployed and verified, or the project lead explicitly accepts a text-only fallback that prominently corrects the schedule;
5. the actual live link, mobile rendering and no-collection state are rechecked;
6. explicit social-account publication authorization is recorded.

The text-only fallback captions are ready in [LAUNCH_CAPTIONS_PA_EN_HI.md](./LAUNCH_CAPTIONS_PA_EN_HI.md). Do not describe the survey as open.

## Decision B — genuine survey-response collection

**Decision: NO-GO.**

Missing production infrastructure, key custody, private MySQL/TLS evidence, reliable backup/PITR, monitoring/on-call operations, independent legal/privacy, linguistic, methodology, accessibility and security approvals, and all six release-bound authorizations make collection unsafe and unauthorized. ₹0 options reviewed do not currently satisfy all controls.

The 5 November plan creates no exception. Keep response collection disabled, all five operational approvals false, final launch approval false and AI disabled.

## Exact next actions and owners

| Owner                                | Action                                                                                                | Required evidence                             |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Project lead                         | Review diff, scope, captions and choose static release or explicit fallback                           | Signed/versioned decision                     |
| Punjabi reviewer                     | Review all changed Gurmukhi and launch copy                                                           | Name, findings, decision, date, evidence link |
| Hindi reviewer                       | Review all changed Devanagari and launch copy                                                         | Name, findings, decision, date, evidence link |
| Accessibility reviewer               | Review exact release candidate and final assets                                                       | Keyboard/zoom/screen-reader/mobile findings   |
| Release engineer                     | After separate authorization only: commit, push, build preview, verify and request promotion approval | Exact SHA, preview URL and checklist          |
| Aman                                 | Produce final approved-logo assets and alt text; publish only with account authorization              | Asset versions and post URLs                  |
| Lovejot                              | Share neutral preview message only through consented channels                                         | Authorized channel log                        |
| Simran                               | Confirm ₹0 spend and reject chargeable services                                                       | Zero-spend record                             |
| Security/legal/methodology reviewers | Complete production collection reviews                                                                | Independent evidence; no synthetic sign-off   |

No action in this package authorizes production response collection.

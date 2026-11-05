# Genuine collection blockers

The public preview is not evidence that confidential political-opinion collection is ready.

| Control                                                        | Status                                     | Evidence or gap                                                             |
| -------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| Questionnaire, consent and intake design                       | Completed with local synthetic evidence    | Step 5A; no real participants                                               |
| MySQL migrations, privileges and recovery behavior             | Completed with disposable local evidence   | Steps 5B/5D: documented MySQL 8.4.13 run; not production                    |
| Fail-closed collection flow and approvals                      | Implemented but not production verified    | Steps 5C–5E                                                                 |
| Transactional audit/outbox and receipt recovery                | Completed with local synthetic evidence    | Step 5D                                                                     |
| TLS staging journey                                            | Implemented but browser trust not verified | Step 5E self-signed certificate was not trusted by BrowserAct               |
| Production intake service                                      | Not provisioned                            | Requires approved infrastructure                                            |
| Private MySQL 8.4 connectivity and verified TLS                | Not provisioned                            | Requires approved infrastructure/funding                                    |
| Civic/political key separation and KMS/HSM custody             | Interface/design only                      | No approved production key custodian                                        |
| Administrator identity, MFA and least privilege                | Not production verified                    | IdP, accounts and access review absent                                      |
| Signed release governance                                      | Implemented locally; no real approvals     | Six gates remain false                                                      |
| External audit delivery, monitoring and alerts                 | Not production verified                    | No independent monitored destination/on-call evidence                       |
| Screening retention and cleanup                                | Implemented locally                        | Policy/legal approval and production job evidence absent                    |
| Consent, age, withdrawal and complaint policy                  | Requires actual legal/privacy review       | No named reviewer decision                                                  |
| Statistical claims and disclosure protection                   | Requires methodology review                | Voluntary responses must not be described as representative voter estimates |
| Encrypted backup, PITR, restore quarantine and deletion replay | Tested synthetically                       | No managed production backup or restore drill                               |
| Incident response, emergency stop and rollback                 | Designed/tested locally                    | No trained production operators or witnessed exercise                       |
| Penetration/security review                                    | Requires independent reviewer              | No external report                                                          |
| Punjabi/Hindi review                                           | Requires human reviewers                   | No signed linguistic approval                                               |
| Accessibility review                                           | Automated/local browser evidence only      | Screen reader, zoom/reflow and assistive-tech review incomplete             |
| Release authorization                                          | Missing                                    | Final launch and five operational approvals remain false                    |

Primary evidence:

- [Step 5A verification](https://github.com/swaich-Techno/Panjab.117/blob/d208ed0ee884aa215f459b3ea5338947f4b15297/docs/evidence/STEP_5A_VERIFICATION.md)
- [Step 5B verification](https://github.com/swaich-Techno/Panjab.117/blob/03c5d67d9ba9ecd46295450cf251ec22d5ee74be/docs/evidence/STEP_5B_VERIFICATION.md)
- [Step 5C verification](https://github.com/swaich-Techno/Panjab.117/blob/eb0f3c168ad9471fc72a4ed06cd7ba9b968a6f57/docs/evidence/STEP_5C_VERIFICATION.md)
- [Step 5D verification](https://github.com/swaich-Techno/Panjab.117/blob/3ca5288e7de1d3bb8c9611136692a00aef70e6cf/docs/evidence/STEP_5D_VERIFICATION.md)
- [Step 5E verification](https://github.com/swaich-Techno/Panjab.117/blob/eedd89587635a60faf1cc7ee67ee60069cfbbc54/docs/evidence/STEP_5E_VERIFICATION.md)
- [Step 5E production security gaps](https://github.com/swaich-Techno/Panjab.117/blob/eedd89587635a60faf1cc7ee67ee60069cfbbc54/docs/security/STEP_5E_PRODUCTION_SECURITY_GAPS.md)

None of these local/synthetic milestones authorizes genuine collection.

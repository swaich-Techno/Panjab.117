# Step 4B live survey collection gate

This gate is independent from the public-preview gate. A public preview may be
approved while every collection control remains false.

| Gate                                         | Current status       | Required evidence                            |
| -------------------------------------------- | -------------------- | -------------------------------------------- |
| final privacy notice and verified contact    | blocked              | legal/privacy approval and published contact |
| participant and age policy                   | blocked              | legal/methodology approval                   |
| Punjabi and Hindi linguistic review          | blocked              | signed reviewer evidence                     |
| legal/privacy and methodology review         | blocked              | signed reviewer evidence                     |
| accessible live intake flow                  | blocked              | independent audit and remediation            |
| production IdP, MFA and least privilege      | blocked              | configuration and denial tests               |
| private database and managed encryption keys | blocked              | provisioned architecture and key evidence    |
| one transactional intake operation           | design verified only | production concurrency/failure tests         |
| durable distributed rate limiting            | design verified only | production load/bypass tests                 |
| withdrawal, appeal and deletion operation    | design verified only | end-to-end operational test                  |
| encrypted backup and deletion-safe restore   | blocked              | restore evidence and accepted RPO/RTO        |
| confidential logging restrictions            | design verified only | provider/log-pipeline canary tests           |
| WAF, abuse monitoring and incident response  | blocked              | load test, alerts and tabletop evidence      |
| production security approval                 | false                | evidence-backed owner approval               |
| privacy approval                             | false                | evidence-backed owner approval               |
| consent approval                             | false                | evidence-backed owner approval               |
| backup/recovery approval                     | false                | evidence-backed owner approval               |
| operations approval                          | false                | evidence-backed owner approval               |
| launch approval                              | false                | explicit owner decision after all gates      |
| separate authorization to enable collection  | absent               | dated, scope-specific authorization          |

No date, traffic need or public-preview approval can substitute for a blocked
control. There is no submission endpoint in Step 4B.

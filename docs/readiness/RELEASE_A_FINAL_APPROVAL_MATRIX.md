# Release A final approval matrix

Candidate source: `9319c1dcee615fd387e0a5333c366aefb5cd3cda`

| Gate                                            | Status                                       | Evidence or missing decision                                                                           |
| ----------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Exact source identity                           | Verified                                     | Local commit above on isolated branch                                                                  |
| Static artifact frozen                          | Verified                                     | 667 files; tree SHA-256 `ac32265832d95a71a4de916b165896a6dd337278abfd98ceb45ff34b84671b61`             |
| ZIP extraction rehash                           | Verified                                     | ZIP SHA-256 `0e5655a81d56ecb231af5ee7e59d959b5ba6a8ea1ed3c6e826b121f8322944c3`; extracted tree matched |
| 125 routes / 117 profiles                       | Verified                                     | Static verifier passed; 3,622 internal references checked                                              |
| Branding and metadata                           | Verified technically                         | Rendered PANJAB/PUNJAB guard and browser checks passed                                                 |
| Redirects/security headers                      | Verified locally                             | Root/legacy redirects, CSP, HSTS and noindex passed                                                    |
| Read-only boundary                              | Verified                                     | No runtime function, API, form, participant store, production DB or external AI                        |
| Owner English approval                          | Approved for earlier source; not independent | Harkirat's genuine decision covers `e2847f6`; exact inspected routes were not supplied                 |
| Independent branding-delta English review       | Pending                                      | No complete genuine reviewer record located                                                            |
| Human accessibility/assistive-technology review | Pending                                      | No complete genuine reviewer record located                                                            |
| Current production unchanged                    | Verified read-only                           | Production matches historical deployment homepage and lacks the new headline                           |
| Selectable rollback deployment                  | Pending dashboard confirmation               | `100d72ea-b09d-4ac6-a24f-e51fdf5a7b78` is reachable but selectability is unverified                    |
| Separate production deployment authorization    | Pending                                      | Not supplied                                                                                           |
| Genuine survey collection                       | Disabled                                     | Both phases, five operational approvals and final launch approval are false                            |

## Decisions

- **Release A: NO-GO.** Engineering and artifact evidence pass, but genuine
  independent/delta English review, human accessibility review, dashboard
  rollback selection and separate deployment authorization remain missing.
- **Release B1 Fatehgarh Sahib: NO-GO.** No approved production infrastructure
  or collection approvals exist.
- **Release B2 statewide: NO-GO.** The statewide phase is independently disabled
  and has the same infrastructure, human and approval blockers.

The earlier artifact and evidence remain historical and unchanged. This matrix
does not authorize push, deployment, Cloudflare mutation, collection, AI or
spending.

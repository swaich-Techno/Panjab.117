# Step 5E production security gaps

Date: 5 November 2026

Status: **production collection blocked**

## Unfunded controls

The ₹0 development environment cannot responsibly provide all of the following for confidential civic and optional political-opinion data:

- a supported, privately networked, continuously available MySQL 8.4 service;
- managed workload identity and short-lived credentials;
- independently administered civic, political and backup KMS authorization domains;
- encrypted PITR plus independently retained backups and tested recovery capacity;
- Indian-jurisdiction security logging where applicable, tamper resistance and monitored alert delivery;
- WAF/rate enforcement, incident on-call coverage and emergency response ownership;
- administrator MFA, two-person approval, periodic access review and break-glass custody;
- contractual processor/subprocessor, location, deletion, breach and support commitments;
- independent legal/privacy, language, methodology, accessibility and security sign-off.

Free services that lack a VPC/private endpoint, fixed region, SLA, retained recovery history or key separation are not made acceptable by application encryption alone. A service outage, account suspension, provider-region change or lost free allowance could prevent withdrawal, deletion, incident response and recovery.

## Fail-closed protections already present

- No public intake route exists in the Next.js application.
- Final launch and all five operational approvals remain false.
- Signed production evidence is release-bound and cannot be replaced by a Boolean flag.
- Live intake rejects missing, expired, revoked, untrusted or mismatched evidence.
- HTTP, cross-origin, invalid CSRF, invalid consent, database, secret and key failures fail closed.
- Raw civic and political access are separately authorized and require MFA context.
- Backups are authenticated and encrypted; restores require deletion-ledger validation and quarantine.
- AI remains disabled and is outside the intake data path.

## Current legal/security review note

The Digital Personal Data Protection Act, 2023 and Rules, 2025 use phased commencement. The official 13 November 2025 notification schedules most processing obligations in Act sections 3–17 and Rules 3 and 5–16 for eighteen months after publication; on 5 November 2026 those provisions are not yet at that date. Panjab 117 should nevertheless design to the published requirements and obtain Indian counsel before collection. Sources: [MeitY commencement notification](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf), [final Rules](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf), and [India Code Act](https://www.indiacode.nic.in/bitstream/123456789/22037/2/a2023-22.pdf).

CERT-In’s 2022 directions include incident reporting, point-of-contact and secure 180-day India-jurisdiction log requirements for covered entities. Applicability and the conflict between security-log retention and privacy minimization require counsel and security review; intake bodies must never enter those logs. Source: [CERT-In directions](https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf).

The Representation of the People Act, 1951 includes election-period and exit-poll publication restrictions. This civic questionnaire is not designed as an exit poll or representative prediction, but counsel must review timing, recruitment, wording and publication before any election-period activity. Source: [India Code RPA 1951](https://www.indiacode.nic.in/bitstream/123456789/2096/9/A1951-43.pdf).

## Blocker decision

Until the unfunded controls and independent approvals exist, genuine collection must remain disabled. The 5 November target date does not override any gate.

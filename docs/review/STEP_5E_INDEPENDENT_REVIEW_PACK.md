# Step 5E independent review pack

Date: 5 November 2026

All reviews below are **not started**. No blank field or test result is an approval.

## Common release evidence

- exact commit SHA: pending checkpoint approval;
- immutable image digest/SBOM: not created;
- questionnaire: `fatehgarh-sahib-civic-2026-11-draft-1`;
- consent: `fatehgarh-sahib-consent-2026-11-draft-1`;
- age policy: draft and not approved;
- production architecture: contract only, not provisioned;
- public preview: read-only and non-indexed;
- genuine collection: disabled.

Each reviewer must record name, role/credentials, independence/conflicts, date, materials reviewed, findings, required corrections, residual risk, decision, approved version/digest and signature/evidence reference.

## 1. Indian legal and privacy counsel

Review the final Data Fiduciary identity and contact; DPDP Act/Rules phased commencement; itemised notice; specific/voluntary consent; withdrawal ease; grievance handling; children/age policy; processors and subprocessors; transfer/location; retention/deletion; breach response; CERT-In applicability; political-opinion harm; election-period recruitment/publication; and anonymous withdrawal limitations.

Authoritative starting sources:

- [DPDP Act, 2023](https://www.indiacode.nic.in/bitstream/123456789/22037/2/a2023-22.pdf)
- [DPDP commencement notification, 13 November 2025](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf)
- [DPDP Rules, 2025](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)
- [CERT-In 2022 Directions](https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf)
- [Representation of the People Act, 1951](https://www.indiacode.nic.in/bitstream/123456789/2096/9/A1951-43.pdf)

Decision: **not reviewed**.

## 2. Punjabi and Hindi language reviewers

Review every notice, question, option, validation error, receipt, retry and withdrawal message in context. Confirm plain language, dialect/register, meaning equivalence, reading burden, political neutrality, Unicode rendering and that “anonymous” is not overstated. Test with screen readers and low-literacy facilitation. Machine or developer translation must not be described as verified.

Punjabi decision: **not reviewed**. Hindi decision: **not reviewed**.

## 3. Survey methodologist

Review the nine-segment sampling/recruitment plan, exclusion and non-response bias, question order, response options, optional political section, duplicate handling, missingness, weighting prohibition until justified, minimum cell sizes, uncertainty, suppression, pre-analysis plan and claim language. Results must not be presented as representative polling or election prediction without a defensible design.

Decision: **not reviewed**.

## 4. Accessibility specialist

Review against WCAG 2.2 AA and Indian public-sector/accessibility obligations identified by counsel: keyboard flow, focus, headings, labels/instructions, status/error announcements, language changes, zoom/reflow at 320 CSS px, contrast, target sizes, reduced motion, cognitive load and assisted alternatives. Test English, Punjabi and Hindi on representative desktop/mobile browsers and screen readers.

Decision: **not reviewed**.

## 5. Independent security reviewer

Review threat model and source; public/private boundary; TLS; CSRF/origin/Fetch Metadata; body limits; validation; transaction and replay behavior; rate/duplicate retention; encryption context; KMS separation; identity/MFA; SQL grants/migrations; outbox; logs; withdrawal; backup/PITR; deletion replay; restore quarantine; emergency stop; supply chain; CI; secret rotation; incident response and tested recovery. Perform an authorized penetration test only against isolated synthetic staging.

Decision: **not reviewed**.

## Approval rule

All required corrections must be implemented and reverified. The signed review records must be bound to the exact release. Reviews do not themselves enable collection: all five operational approvals and final launch approval must still be independently signed, current and release-bound.

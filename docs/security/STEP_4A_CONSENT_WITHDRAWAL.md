# Step 4A consent, privacy and withdrawal design

Status: **draft architecture; not legal advice; no collection enabled**

All English, Punjabi and Hindi notice text is an editorial draft. Human
linguistic and legal review is mandatory before publication. The privacy contact
is deliberately a placeholder; verified organisation and contact details are a
launch blocker.

## Primary legal references

The design is informed by the official [Digital Personal Data Protection Act,
2023](https://www.indiacode.nic.in/bitstream/123456789/22037/2/a2023-22.pdf)
and the final [Digital Personal Data Protection Rules,
2025](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf).
The Rules and Act have phased commencement dates, so counsel must confirm which
provisions apply on the actual launch date. This design does not claim legal
compliance by itself.

The draft follows these requirements and principles:

- standalone, clear and plain-language notice;
- itemised data and specified purposes;
- affirmative, specific and unbundled consent;
- proof of the notice and consent version used;
- withdrawal as easy as giving consent; and
- cessation of future consent-based processing after withdrawal, subject to
  lawful exceptions reviewed by counsel.

## Data minimisation

The proposed anonymous civic path collects only:

- questionnaire version and consent-notice version;
- selected Assembly segment;
- structured civic answers;
- separately chosen political-opinion answers, only when opted in;
- an opaque response ID and one-time withdrawal-code digest;
- minimum operational timestamps; and
- keyed, short-lived security signals for idempotency, duplicate review and
  rate limiting.

Do not collect raw IP addresses, browser fingerprints, advertising identifiers,
electoral-roll data, names, telephone numbers, email addresses or precise
location by default. Optional contact, if later justified, must be separately
consented, separately encrypted and retained for a shorter period.

## Anonymous versus identifiable

An anonymous response has no contact field attached. A participant would receive
a one-time withdrawal code. Only a keyed digest is stored. If the participant
loses the code, a specific response may be impossible to find without weakening
anonymity; the notice must explain this before consent.

An identifiable response would use optional contact information stored in a
separate identity boundary. This path is not implemented. Before it exists, the
team must approve its necessity, verification method, encryption, access roles,
retention and identity-response unlinking process.

## Consent evidence

The immutable consent event should record:

- questionnaire and notice version IDs;
- locale shown;
- civic participation choice;
- independent political-opinion choice;
- UTC timestamp and opaque response ID;
- digest of the exact localized notice; and
- withdrawal or later purpose-change events.

No checkbox may be preselected. Political consent cannot be inferred from civic
consent, browsing or answering another question.

## Withdrawal and deletion workflow

The synthetic state machine in `src/lib/survey/consent.ts` enforces:

1. `received` — create an opaque case ID without copying answers into a ticket.
2. `verification_pending` — verify the withdrawal code or proportionate optional
   contact locator.
3. `verified` or `unable_to_locate` — fail safely when the anonymous record
   cannot be found.
4. `approved` — privacy officer confirms scope and any lawful retention need.
5. `live_data_deleted` — destroy answer/identity DEKs or delete permitted data;
   stop future optional processing.
6. `backup_ledger_recorded` — add a protected deletion marker so restoration
   cannot silently resurrect the record.
7. `completed` — retain only minimal, justified completion evidence.

Invalid shortcuts fail closed. Synthetic tests verify that completion cannot be
reached before live deletion and backup-ledger recording.

## Retention proposal

| Data                         | Proposed maximum                   | Approval needed                         |
| ---------------------------- | ---------------------------------- | --------------------------------------- |
| structured answers           | 12 months after collection closes  | research, privacy and legal owners      |
| optional contact             | 30–90 days                         | documented follow-up necessity          |
| duplicate/rate-limit signals | abuse-review window plus appeals   | security/privacy with key-rotation plan |
| consent/deletion evidence    | minimum approved compliance period | legal/privacy                           |
| encrypted backups            | existing tiered backup schedule    | deletion-ledger replay verified         |

These are proposals, not active policy. Exact start events, erasure methods,
legal holds, backup behavior and audit evidence require approval.

## Launch blockers

- verified Data Fiduciary identity and privacy/grievance contact;
- approved lawful basis, participant population and age policy;
- final notice, consent, withdrawal and complaint flows in all three languages;
- end-to-end rights testing against production-equivalent encrypted backups;
- processor/sub-processor terms and cross-border assessment; and
- documented incident and breach-response ownership.

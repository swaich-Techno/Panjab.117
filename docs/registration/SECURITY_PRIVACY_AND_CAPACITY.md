# Registration security, privacy and capacity design

## Capacity interpretation

The provisional interpretation is exactly 100 eligible confirmed registrations for each active top-level category across the complete nine-segment pilot. It is not 100 per Assembly segment. The `others` sub-options share one 100-place category. The cap does not apply to the general civic questionnaire.

The cap is configuration, not a research sampling method. Category capacity must never be represented as public support, vote share, a representative panel or an election prediction.

## Atomic enforcement

The local `SyntheticRegistrationCapacityService` serializes state changes under one exclusive queue and defaults to an active emergency stop. Tests must explicitly disable that synthetic stop before exercising successful paths. The MySQL design uses an InnoDB transaction and `SELECT ... FOR UPDATE` on the category capacity row. A confirmed-registration insert and capacity increment must commit together or both roll back.

Unique constraints protect both the idempotency-key hash and the synthetic participant hash. An exact retry returns the original registration ID. Reusing an idempotency key with different data fails. A duplicate participant cannot consume a second place or switch categories automatically.

The 101st eligible attempt receives a neutral “capacity reached” result. Declined, invalid, duplicate, disabled-category and failed-database attempts do not consume capacity.

## Withdrawal

A place is released only after a verified withdrawal changes the registration to `withdrawn`, writes the withdrawal record and decrements the category capacity inside one transaction. Failed or unverified withdrawal requests do not release a place.

The participant hash remains in a suppression/uniqueness record after withdrawal. Re-registration is not automatic; it requires a later approved privacy and anti-abuse policy. This prevents repeated withdrawal/re-registration from manipulating category capacity.

## Political-opinion privacy

Party or organisation selection can reveal political opinion. Any genuine system would need a separately reviewed lawful basis, explicit and voluntary political-opinion consent, purpose limitation, strict minimization, a short approved retention schedule, withdrawal handling, encryption-key separation, access auditing, breach response and disclosure controls.

The prototype requests no name, address, phone number, email, device fingerprint or free text. It uses no network call or browser persistence. Synthetic test identifiers are required by the local capacity service.

Public category counters are prohibited. Even aggregate reporting requires disclosure-risk review and minimum-cell thresholds. Candidate and category data are public directory information; registration records would be confidential.

## Fail-closed controls

- Public registration enabled: false.
- Production database configured: false.
- Emergency stop: active.
- Final launch approval: false.
- Production-security approval: false.
- Privacy approval: false.
- Consent approval: false.
- Backup/recovery approval: false.
- Operations approval: false.
- External AI: disabled.

No date, candidate announcement or category-capacity state can bypass these gates.

## Production blockers

Genuine collection remains blocked until independent legal/privacy, linguistic, methodology, accessibility and security reviews are complete; production identity and MFA are approved; TLS/private networking and managed key custody exist; encrypted backup/PITR and restore evidence exist; incident response and emergency-stop ownership are tested; retention and deletion are approved; and the exact release receives separate authorization.

At the current ₹0 budget, no claim is made that a free service meets all confidential-data security and recovery requirements. The prototype therefore remains local and synthetic.

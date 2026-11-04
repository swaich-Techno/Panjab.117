# Step 5C end-to-end test evidence

**Data:** synthetic only

**Environment:** local Node/Vitest; no public endpoint or production provider

## Automated journey

`step5c-end-to-end.test.ts` executes:

1. validated Punjabi submission with separate political consent;
2. civic and political encryption under distinct key purposes;
3. one-time withdrawal receipt issuance;
4. MFA/purpose-gated civic decryption by the authorized role;
5. encrypted logical backup and integrity-checked restore;
6. receipt verification and deletion of both answer partitions; and
7. restored-response suppression from the deletion ledger.

The HTTP tests separately cover all nine constituencies and all three locales,
HTTPS, Origin/CORS, Fetch Metadata, CSRF, body-size enforcement, malformed and
injection-shaped values, safe audit data and the closed production gate.

## Coverage mapping

| Requirement                                | Evidence                                     | Status                             |
| ------------------------------------------ | -------------------------------------------- | ---------------------------------- |
| Nine constituencies / three languages      | HTTP matrix, 27 accepted synthetic requests  | automated                          |
| Consent refusal / forged consent           | existing intake validation tests             | automated                          |
| Optional political consent                 | questionnaire and secure-intake tests        | automated                          |
| Required constituency / optional questions | questionnaire tests                          | automated                          |
| Replay / duplicate / rate limiting         | secure-intake and Step 5B concurrency tests  | automated                          |
| Encryption isolation / tamper / rotation   | encryption and secure-intake tests           | automated                          |
| Receipt / withdrawal / deletion            | end-to-end and withdrawal tests              | automated                          |
| Lost-response receipt recovery             | no safe recovery protocol implemented        | launch blocker                     |
| Backup / integrity / suppression           | backup and end-to-end tests                  | automated                          |
| Atomic intake/audit durability             | transport port only; no durable outbox       | launch blocker                     |
| SQL roles / real transactions / restore    | Step 5B disposable MySQL evidence            | prior evidence; fresh run required |
| Desktop/mobile/screen reader               | no suitable interactive environment executed | not verified                       |
| Production WAF/KMS/IdP/managed MySQL       | no production-equivalent environment exists  | not verified                       |

Synthetic in-memory execution proves control composition, not managed-service
behavior, operational recovery or production approval.

# Database design

Status: logical design only. No database, migration, account, or real record has been created.

## Design principles

- Separate published, confidential, and security data into distinct MySQL schemas and accounts.
- Keep identity optional and detached from response content.
- Encrypt selected restricted values before they reach MySQL.
- Preserve immutable versions instead of editing published research or survey definitions in place.
- Enforce relationships with foreign keys, uniqueness, checks, and server-generated UTC timestamps.
- Use opaque UUIDv7/UUIDv4 identifiers for externally correlated objects; never expose sequential internal IDs.
- Do not use free-text logs or JSON as a substitute for normalized authorization, consent, or answers.
- Treat deletion as a privacy workflow: legal holds are explicit; expired identity and answer material is cryptographically erased where feasible.

## Schema boundaries

| Schema                | Contents                                                                                                                           | Permitted application access                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `panjab_public`       | constituencies, localized content, sources, citations, research/report versions, approved survey definitions, publication metadata | public reader gets `SELECT` on published views only; publisher gets workflow-specific writes                                    |
| `panjab_confidential` | response sessions, consent, encrypted answers, separately encrypted optional identity, retention state                             | ingestion account inserts through stored procedures/API transaction; processor gets narrowly scoped reads; public app gets none |
| `panjab_security`     | admin identity references, roles, permissions, approvals, append-only audit chain, key metadata without key material               | authentication/authorization and audit-writer accounts only                                                                     |

MySQL schemas are a privilege boundary, not a cryptographic or tenancy boundary. Compromise of the DB administrator still exposes ciphertext and metadata, so application encryption, OCI IAM separation, and external audit/backup controls remain necessary.

## Public and research model

### Constituency content

- `constituencies`: immutable opaque ID, official constituency number, stable slug/code, lifecycle status, timestamps. The initial 117-row source must be verified before import.
- `constituency_content_versions`: constituency FK, locale (`en`, `pa`, `hi`), version, title, summary/body, workflow state, source snapshot, author/reviewer references, effective/published timestamps. Unique `(constituency_id, locale, version)`.
- A published view exposes only the highest approved version for each constituency and locale.

### Research provenance

- `research_sources`: source type, title, publisher, canonical/archive URLs, publication/access dates, SHA-256 digest, verification status.
- `research_reports` and `research_report_versions`: stable report identity plus immutable localized/versioned content.
- `citations`: source FK and exactly one target FK (`report_version_id` or `constituency_content_version_id`), locator, quotation digest, verification state.
- `verification_events`: source/claim target, verifier admin ID, outcome, notes with no personal data, timestamp.
- `correction_records`: target version, reason, public correction note, superseding version, approver, timestamps. Published rows are superseded, never silently rewritten.

### Survey definition model

- `survey_definitions`: stable survey identity and lifecycle state; contains no answers.
- `survey_versions`: immutable title/introduction/notice references, language availability, open/close window, version status.
- `survey_questions`: stable per-version question code, type, required flag, sensitivity class, display order.
- `survey_question_localizations`: question/locale wording and help text.
- `survey_options` and `survey_option_localizations`: version-owned choices. Randomization and branching rules should use constrained columns or a versioned, schema-validated rule document.

Only an approved, immutable survey version may accept responses. Question changes require a new version.

## Confidential response model

- `response_sessions`: opaque response ID, survey version, status, coarse risk flags, created/submitted timestamps, retention deadline. No raw IP, user-agent, browser fingerprint, constituency inference, or advertising identifier.
- `consent_records`: response FK, exact privacy-notice version, consent event (`granted`, `withdrawn`), authenticated UTC timestamp, collection channel, evidence digest.
- `consent_purposes`: normalized approved purposes.
- `consent_record_purposes`: consent record/purpose link with granted flag. Optional political-opinion processing requires a purpose-specific affirmative record and legal approval.
- `encrypted_answers`: response/question FKs, ciphertext, 96-bit nonce, authentication tag, encrypted-DEK reference, key/AAD versions, timestamps. Unique `(response_id, question_id)` unless the question explicitly permits multiple instances.
- `response_identities`: optional one-to-one response FK with independently encrypted contact/identity fields and its own retention deadline. It is never required merely to submit an anonymous response.
- `data_subject_requests`: separately authorized workflow referencing an identity locator digest, request type/status, deadlines, and audit correlation; it must not expose answer plaintext.

The ingestion transaction validates the active survey version and consent, creates the response, writes encrypted answers, and appends an audit event. Failure rolls back the full transaction. Idempotency keys are stored as keyed digests with a short expiry to make retries safe without becoming identifiers.

## Identity, authorization, and publication model

- `admin_identities`: external identity-provider subject digest, status, MFA assurance requirement, timestamps. No locally fabricated authentication.
- `roles`, `permissions`, `role_permissions`, `admin_role_assignments`: normalized RBAC with assignment scope and expiry.
- `publication_approvals`: content version, approval stage, approver, decision, reason, timestamps; prevent author self-approval for sensitive publication.
- `audit_events`: event UUID/time, actor reference, role snapshot, action, target type/opaque target ID, outcome, request correlation ID, coarse network digest, redacted metadata, previous hash, event hash. Insert-only application access.
- `encryption_key_versions`: non-secret key alias/OCID digest, purpose, state, activation/retirement dates. It contains no key or plaintext DEK.

## Indexing and constraints

- Index every FK used for joins or deletion checks.
- Composite indexes follow access paths: published locale lookup, survey-version status/window, response retention/status, consent response/time, audit time/actor/action.
- Use `CHECK` constraints for constrained status values and exactly-one-target citation logic, while also validating in application code.
- Use `utf8mb4` and an appropriate Unicode collation; preserve Punjabi Gurmukhi and Hindi Devanagari exactly. Slugs are separate ASCII identifiers.
- All timestamps are UTC `TIMESTAMP(6)` or `DATETIME(6)` with explicit application semantics.
- Large content and ciphertext sizes are bounded at both API and DB layers.
- Do not index ciphertext. Use narrowly scoped keyed blind indexes only if an approved use case requires equality lookup; accept leakage and rotation cost explicitly.

## Transaction and deletion rules

- Survey submission: one transaction for session, consent, answer ciphertext, optional identity ciphertext, and idempotency record.
- Publication: immutable version plus two-person approval where required; a view switches to the approved version atomically.
- Consent withdrawal/deletion: mark workflow, delete optional identity first, delete/cryptographically erase answer material according to policy, retain only minimal non-identifying compliance evidence, and append an audit event.
- Foreign keys default to `RESTRICT`; privacy deletions use reviewed procedures rather than broad cascades. Narrow child tables may use `CASCADE` only where the parent is the complete lifecycle owner.

## Capacity considerations

The 50 GiB limit includes data and logs. Ciphertext, authentication metadata, indexes, audit rows, and independent backup staging increase storage. Step 2B must benchmark representative synthetic records, estimate growth at p50/p95 response size, configure capacity alerts, and define a stop-collection threshold. HeatWave is unnecessary for the initial OLTP design; analytics should consume de-identified, purpose-limited extracts rather than query raw identity-linked responses.

## Draft schema

A non-executable design draft is in [`docs/design/mysql-schema-draft.sql`](../design/mysql-schema-draft.sql). It deliberately omits production credentials, grants containing secrets, migrations, and real constituency/survey data. It must receive DBA, privacy, and application review before conversion to a migration.

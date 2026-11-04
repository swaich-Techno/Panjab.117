# Step 5C database security

**Status:** production-oriented design and disposable-MySQL foundation; no
production database exists

## Record model

The Step 5B schema already binds each response to a response UUID, collection
approval, immutable questionnaire version, consent version/digest, Assembly
segment, locale, submission time, civic/political consent, quality status,
withdrawal status and `synthetic_only` marker. Civic and political ciphertext,
wrapped data keys and withdrawal digests occupy separate tables.

Database and server validation restrict the launch scope to Assembly segments
54, 55, 56, 57, 58, 59, 67, 69 and 106. No name, phone number, email, precise
location or device fingerprint is in the intake contract.

## Cryptography

- Per-response AES-256-GCM data keys; AAD binds purpose, owner, schema, table,
  field, questionnaire and constituency.
- Independent civic and political key purposes; political decryption requires
  a distinct role and separate consent.
- Production must replace the in-memory provider with non-exportable,
  separately governed KMS/HSM KEKs and workload identity.
- Withdrawal destroys encrypted payload access and records an external backup
  suppression action. Backup restore must replay that ledger before promotion.

## MySQL controls

- Managed MySQL 8.4 LTS, private endpoint, TLS with CA and hostname validation,
  `require_secure_transport=ON`, no public database address.
- Separate ingestion, migration, privacy, backup, audit and reviewer accounts.
  No application account receives DDL, user-management or global privileges.
- Parameterized values, strict constraints, foreign keys, approval registry and
  transactional writes.
- Deadlock retry is bounded; an uncertain commit must be retried only with the
  same idempotency key.
- Binary logs, slow/error logs and backups must be encrypted, access-restricted
  and included in retention/withdrawal analysis. Query/body logging is banned.

## Retention

Fixed long-lived screening windows were removed. The production policy is
currently `draft`, so it cannot operate. Legal/privacy, security and methodology
owners must approve purposes, durations, cleanup ownership and destruction
evidence. A scheduled production cleanup role is still missing.

## Verification gap

Step 5B passed against disposable MySQL 8.4.13, including migrations,
permissions, concurrency, failures, withdrawal and restore. The server was
removed. The new retention-window SQL has not yet been executed against real
MySQL and must receive a fresh disposable run before any staging approval.

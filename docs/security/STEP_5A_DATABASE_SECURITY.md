# Step 5A database and encryption security

## Data minimization

The draft schema permits only a random response ID, immutable questionnaire
and notice references, notice digest, one of the nine approved Assembly
segments, locale, consent flags, timestamp, non-identifying quality status,
withdrawal state and encrypted answer partitions. It has no column for name,
phone, email, address, GPS, browser fingerprint, advertising identifier or raw
IP address.

The term “anonymous” is not approved. Random identifiers and minimized fields
reduce risk but do not prove that answers cannot identify a participant.

## Separation and encryption

- Civic and political answers use different tables, envelope purposes and
  key-encryption keys.
- Every response partition receives a random 256-bit AES-GCM data key. Only its
  wrapped form is stored.
- Authenticated context binds ciphertext to purpose, response, table, field,
  questionnaire version and Assembly segment.
- Database/storage encryption is required in addition to application-level
  encryption; TLS is mandatory in transit.
- KEKs must live in an approved KMS/HSM. No production key may be stored in the
  repository, database or public runtime.
- Rotation rewraps data keys under a new KEK version. Old KEKs remain available
  only for the documented rotation/recovery window, then are destroyed after
  verification.

## Transactions and integrity

The future durable adapter must use one transaction for response header,
answer partitions, withdrawal digest and idempotency/duplicate/rate claims.
Unique constraints arbitrate concurrent claims. On any failure the transaction
rolls back. Queries must be parameterized; dynamic table names or SQL fragments
from request data are prohibited.

`database/migrations/mysql/0001_step_5a_secure_intake.sql` defines strict
segment/locale/status constraints and foreign keys.
`0002_step_5a_least_privilege_roles.sql` demonstrates separated ingestion,
civic review, political review, privacy, audit and backup roles. It contains no
accounts or credentials and must not be applied yet.

## Access and export

- Public and static-site identities have no database access.
- Ingestion can insert but cannot read response payloads.
- Civic and political reviewers are separate, authenticated roles with MFA,
  recorded purpose and approval ID.
- Analysts receive disclosure-controlled extracts, never direct raw tables.
- Export authorization and export execution are separate duties. An approval
  expires and can be used once.
- Audit events record actor directory ID, role, action, approval, response ID,
  outcome and time. They must never contain answers or receipt codes.

## Production configuration still required

Approved vendor and India/residency assessment, private network rules,
`require_secure_transport`, database/KMS identities, credential rotation,
patching, monitoring, alerting, encrypted backup/PITR, deletion processing and
incident response are unresolved. MySQL documents that TCP connections are not
secure by default unless TLS is configured or `require_secure_transport` is
enforced: [MySQL transport security](https://dev.mysql.com/doc/refman/8.4/en/transport-protocols.html).

# Encryption and key-management architecture

Status: design for approval; no encryption service or production key has been implemented.

## Data protection layers

1. **Browser to edge:** TLS 1.2+ with modern ciphers; prefer TLS 1.3. Redirect HTTP, use secure cookies, and enable HSTS only after all hostnames are HTTPS-ready.
2. **Edge to OCI origin:** TLS Full (strict), validated origin certificate, restricted direct-origin access, and origin authentication.
3. **Application to MySQL:** private networking plus TLS. Every MySQL application user uses `REQUIRE SSL`; the client loads the Oracle CA and requires certificate and hostname identity verification equivalent to `VERIFY_IDENTITY`. Never accept `PREFERRED`, `REQUIRED` without CA validation, or `rejectUnauthorized: false`.
4. **Managed storage:** Oracle-managed at-rest encryption protects DB block volumes and native backups by default. A customer-managed OCI Vault key may replace it after lifecycle and recovery review.
5. **Application fields:** AES-256-GCM authenticated encryption protects selected answer, optional identity, and high-risk administrative values before insertion.
6. **Backups:** logical backup artifacts are independently envelope-encrypted before Object Storage upload, using a backup-specific key hierarchy.

## Field classification

| Class             | Examples                                                                     | Protection                                                                          |
| ----------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Public            | published report, approved constituency text, public citation                | TLS and managed at-rest encryption; integrity/version controls                      |
| Internal          | draft editorial notes, workflow state                                        | TLS, at-rest encryption, RBAC; field encryption if it identifies a source/person    |
| Restricted        | admin subject mapping, contact details, consent evidence                     | Application AES-256-GCM plus strict RBAC and short retention                        |
| Highly restricted | political-opinion answer, identity-response linkage, recovery/export package | Application AES-256-GCM, separated keys/roles, purpose approval, no ordinary export |

Raw authentication secrets, plaintext data-encryption keys, recovery codes, and private key material are never database fields.

## Envelope format

Use a reviewed runtime library (Node.js built-in `crypto` is acceptable for AES-GCM) rather than custom cryptography.

- Generate a random 256-bit data-encryption key (DEK) per response. Use the operating system cryptographic random generator.
- Encrypt each selected field with AES-256-GCM and a fresh, never-reused 96-bit random nonce under that DEK.
- Persist ciphertext, the 128-bit authentication tag, nonce, algorithm identifier, AAD schema version, and encrypted-DEK ID.
- Bind context as canonical additional authenticated data, for example: application version, schema, table, opaque row ID, field name, survey/question ID, and AAD version. Encoding must be deterministic and length-delimited.
- Wrap the DEK with a purpose-specific OCI Vault key-encryption key (KEK). Store only the wrapped DEK and non-secret key-version reference in MySQL.
- Do not reuse a nonce with the same DEK. Treat a duplicate as a security incident; enforce generation in one library and add collision telemetry that never records key/nonce pairs in logs.
- Decryption authenticates AAD and tag before parsing; any failure returns a generic error, emits a redacted high-severity event, and never returns partial plaintext.

Using a per-response DEK allows identity and answer records to be cryptographically erased by destroying their wrapped DEK, subject to backup retention and legal obligations. Optional identity may use a separate DEK so identity can be erased earlier without removing research answers.

## Key hierarchy and separation

```text
OCI Vault KEK: survey-data / version N
  -> wrapped per-response answer DEK
     -> encrypted answers

OCI Vault KEK: respondent-identity / version N
  -> wrapped per-response identity DEK
     -> optional identity fields

OCI Vault KEK: backups / version N
  -> wrapped per-backup DEK
     -> encrypted logical backup object
```

Key administrators manage lifecycle but cannot read survey data. The application resource principal can invoke only required encrypt/decrypt operations for active application keys. Backup workload can use only the backup key. Analysts, publishers, DB administrators, CI, Cloudflare, and static hosting receive no key permissions.

Oracle documents that software-protected master keys are free and that a limited number of HSM key versions are Always Free; virtual private vaults are excluded. Exact price/limit and deletion semantics must be rechecked in the tenancy before implementation. Disabling or deleting a customer-managed key can make DB systems/backups inaccessible, so destructive key actions require two-person approval and tested recovery.

## Rotation

Routine rotation:

1. Create a new KEK version and test it with synthetic data.
2. Change new encryption to the new version; keep old versions decrypt-only.
3. Rewrap stored DEKs to the new KEK without decrypting bulk answer plaintext where the Vault API supports it; otherwise use a memory-bounded approved job.
4. Verify counts, tags, and sampled decrypt/re-encrypt round trips in isolation.
5. Retire old decrypt permission only after live data and retained backups no longer depend on it.
6. Record approvals and key-version state without key material.

Emergency compromise:

- Disable the affected workload identity/session first, preserve audit evidence, and stop sensitive writes/exports.
- Determine whether the KEK, wrapped DEKs, app memory, backups, or plaintext were exposed.
- Activate a pre-created clean key path and rotate application/DB credentials.
- Rewrap/re-encrypt affected material according to exposure; do not delete the old key until evidence preservation and recoverability are approved.
- Notify privacy/legal owners and follow the incident-response decision tree.

## Password and verifier hashing

Production administrators should authenticate through an external IdP with phishing-resistant MFA, not a new local password store. If a later approved local recovery verifier or password is unavoidable, hash it with a maintained Argon2id library, a unique 128-bit-or-larger random salt, and parameters calibrated on production hardware. A starting benchmark candidate is 64 MiB memory, 3 iterations, parallelism 1; increase within latency/DoS limits. Store algorithm and parameters with the hash. Optionally use a separate Vault-held pepper with an explicit rotation/recovery plan.

Do not encrypt passwords, use reversible hashes, or invent a construction. RFC 9106 is the normative Argon2 reference.

## Secrets and credentials

- Use OCI resource principals for Vault/Object Storage where available.
- Store runtime secrets in OCI Vault, not `.env` committed files, build output, GitHub, Cloudflare, Vercel preview environments, database tables, or logs.
- Local `.env.local` is ignored and may contain only development/synthetic credentials; share through an approved secret manager, never chat or tickets.
- Use distinct credentials per environment and workload, short-lived credentials where supported, and automatic rotation with overlap/rollback.
- CI receives no production decryption or DB privilege. A deployment identity cannot administer keys.

## Required cryptographic tests

- Known-answer and round-trip tests for every envelope version.
- Fail on changed ciphertext, nonce, tag, AAD, row ID, or key version.
- Prove nonce uniqueness under concurrent synthetic load.
- Prove TLS failure for invalid CA, hostname mismatch, expired certificate, and plaintext fallback.
- Prove old/new key-version compatibility during rotation and recovery from interrupted rewrap.
- Restore an encrypted backup in isolation and decrypt approved synthetic samples.

## Sources verified 2026-11-03

- [Oracle MySQL HeatWave features](https://docs.oracle.com/en-us/iaas/mysql-database/doc/features-mysql-heatwave-service.html)
- [Oracle advanced encryption options](https://docs.oracle.com/en-us/iaas/mysql-database/doc/advanced-options.html)
- [Oracle updating an encryption key](https://docs.oracle.com/en-us/iaas/mysql-database/doc/updating-encryption-key.html)
- [MySQL encrypted connections and identity verification](https://dev.mysql.com/doc/refman/8.4/en/using-encrypted-connections.html)
- [RFC 9106: Argon2 memory-hard function](https://www.rfc-editor.org/rfc/rfc9106.html)

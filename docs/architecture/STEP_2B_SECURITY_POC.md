# Step 2B synthetic security proof of concept

Status: local, synthetic-data-only implementation. No cloud resource, DNS, deployment, production credential, or real survey data was used.

## Scope

This phase tests whether critical Step 2A controls can be expressed and verified locally. It does not make the application ready to collect confidential data. The current public Next.js pages are unchanged and the prototype modules are not connected to routes, forms, authentication, or production storage.

## Design corrections and security impact

| Correction                               | Implementation                                                                                                                               | Security impact                                                                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Answer/question survey-version integrity | `encrypted_answers` stores `survey_version_id`; composite FKs bind it to both response and question                                          | A compromised/buggy application cannot attach an answer to a question from another survey version.                                                  |
| DEK ownership                            | Separate answer/identity owner tables; composite `(data_key_id, response_id)` FKs                                                            | Prevents cross-response key substitution.                                                                                                           |
| Key-purpose separation                   | Separate wrap tables plus generated `answer`/`identity` purpose in composite KEK FKs                                                         | An identity KEK cannot be referenced as an answer KEK or vice versa.                                                                                |
| Rotation and active-wrap uniqueness      | Versioned wrap rows, one generated unique active slot, decrypt-only/retired states                                                           | KEKs can rotate without re-encrypting answer ciphertext; duplicate active wraps fail.                                                               |
| Cryptographic deletion                   | Owner `destroyed_at`, triggers guarding active-wrap deletion/new wraps, separate identity/answer workflows                                   | Reduces accidental key loss and makes destructive intent explicit and auditable. Backup replay is still required.                                   |
| Polymorphic references                   | Typed report/constituency citations and corrections; typed report/constituency/survey approvals                                              | Replaces application-only target validation with real foreign keys.                                                                                 |
| Version immutability                     | MySQL triggers block changes/deletes after versions leave draft and block child question/option edits in sealed surveys                      | Prevents silent historical rewriting through direct SQL. Workflow-transition policy remains application-controlled.                                 |
| Least privilege                          | Exact MySQL roles/grants in `mysql-grants.sql`; negative connection tests                                                                    | Public, ingestion, analysis, privacy, security, backup, and migration capabilities no longer depend on prose alone.                                 |
| Audit anchoring                          | Sequence numbers, range checkpoints, terminal hashes, keyed anchor and external receipt digests; Node verification prototype                 | Detects chain/checkpoint tampering when the anchor is held outside MySQL by a separate identity. The local HMAC provider is not production custody. |
| MySQL compatibility                      | Schema, triggers, views, checks, generated columns, grants, dump, and restore executed on MySQL 8.4.13                                       | Removes several unverified syntax assumptions. Exact HeatWave-version testing remains mandatory.                                                    |
| Encryption envelope                      | Node `crypto` AES-256-GCM, random 256-bit DEKs, random 96-bit nonces, fixed 128-bit tags, versioned envelope, length-delimited canonical AAD | Provides confidentiality plus authenticated row/field/purpose binding and fail-closed tamper handling.                                              |
| Backup proof                             | Consistent local logical export, backup-only envelope encryption, digest verification, restore, FK/orphan checks, deletion-ledger replay     | Demonstrates more than export success, but only for a tiny disposable fixture.                                                                      |

## Implementation map

- `docs/design/mysql-schema-draft.sql`: MySQL 8.4.13-compatible schema and triggers.
- `docs/design/mysql-grants.sql`: exact role grants without login accounts or credentials.
- `src/lib/security/encryption.ts`: envelope format, AAD, AES-GCM and DEK lifecycle helpers.
- `src/lib/security/fake-key-provider.ts`: in-memory, purpose-separated KEKs for tests only.
- `src/lib/security/authorization.ts`: deny-by-default simulated application role matrix.
- `src/lib/security/backup.ts`: independently authenticated synthetic backup artifact and ledger binding.
- `src/lib/security/audit-chain.ts`: hash chain and separately verifiable keyed checkpoint.
- `src/lib/security/*.test.ts`: cryptographic, RBAC, backup, audit and MySQL integration tests.

## Security boundaries

- Prototype modules are server-only libraries by design, but they are not imported by the Next.js application.
- The fake key provider holds extractable keys in process memory and has no durable ACL, quorum, remote attestation, or rate control. It is forbidden for any non-test environment.
- Local MySQL uses an insecure initialized root account and loopback-only listener inside a disposable directory. This is acceptable only for the isolated test procedure; production requires private networking, verified TLS, named accounts, `REQUIRE SSL`, MFA-controlled operations, and Vault.
- Synthetic strings and repeated byte buffers are deliberately non-real and non-political. They are not representative entropy, size, or distribution for capacity testing.

## Unresolved issues

1. Exact Oracle HeatWave version, trigger/definer policy, TLS CA distribution, IAM and Vault operations are untested.
2. The schema does not yet implement complete workflow state-transition triggers or a two-person approval stored procedure.
3. Database roles limit direct SQL, but production authorization still needs request/object/scope/purpose tests around every server action.
4. The audit anchor requires a separately controlled production destination, receipt protocol, continuity monitor, and key-rotation design.
5. Backup streaming is buffered in memory for the tiny POC; production needs bounded streaming, large-dataset tests and interruption-safe artifacts.
6. Deletion-ledger custody, authentication, ordering, idempotency and legal-hold conflicts need a production protocol.
7. Restore did not test OCI capacity, Object Storage, Vault outage, cross-region loss, operator error, or production-scale RPO/RTO.
8. No browser, Cloudflare cache, origin, TLS-negative, CSP, CSRF, IdP/MFA, load, log-pipeline, SAST or penetration test was performed.
9. `mysql2` and the existing dependency tree need continuing vulnerability/provenance review; automated fixes were intentionally not applied.

## Next-phase recommendation

After review and approval of these uncommitted changes, the next phase should convert the schema into ordered, reversible migrations; run it against the exact selected HeatWave version; replace the fake provider with a test OCI Vault adapter using synthetic keys; implement a server-only submission transaction behind disabled feature flags; and build object-level authorization, TLS, logging, and recovery tests. Real survey collection must remain disabled.

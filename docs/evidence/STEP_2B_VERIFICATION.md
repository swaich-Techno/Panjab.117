# Step 2B verification evidence

Date: 2026-11-03  
Branch: `feat/step-2b-synthetic-security-poc`  
Scope: local synthetic data only

## Environment

- Windows host, Node.js 22.15.0, npm 10.9.2.
- Next.js 16.4.4, React 19.3.1, TypeScript 6.0.3, Vitest 5.1.0.
- Official MySQL Community Server 8.4.13 LTS Windows ZIP, downloaded from Oracle and verified against the published MD5 `7b94489d5524dea9b27097068bea25a8`.
- Disposable MySQL data directory under the OS temporary directory; loopback `127.0.0.1:3307`; no Windows service, public listener, cloud connection, or real record.

## Final quality results

| Command                                                       | Result                                                                                                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run format:check`                                        | Passed; all matched files use Prettier style.                                                                                                          |
| `npm run lint`                                                | Passed with zero warnings (`--max-warnings=0`).                                                                                                        |
| `npm run typecheck`                                           | Passed (`tsc --noEmit`).                                                                                                                               |
| `npm run test`                                                | Passed: 5 files and 77 tests; 1 file/3 MySQL tests skipped because integration environment variables are deliberately absent from the default command. |
| `npm run test:security:mysql` with disposable MySQL variables | Passed: 1 file, 3 integration tests.                                                                                                                   |
| `npm run build`                                               | Passed; Next.js production build generated `/en`, `/pa`, and `/hi`.                                                                                    |
| Corrected schema via MySQL client                             | Passed on 8.4.13 with warnings enabled.                                                                                                                |
| Exact role grants via MySQL client                            | Passed on 8.4.13 with warnings enabled.                                                                                                                |

## Security-test coverage

- AES-256-GCM round trip; 256-bit DEKs; 96-bit nonce length; 128-bit tags.
- 5,000 generated nonces with no duplicate in the sample. This is not a mathematical uniqueness guarantee.
- Canonical AAD ordering and rejection of reserved-name collisions.
- Fail-closed ciphertext, tag, nonce, metadata, owner, and key-purpose tampering.
- Separate answer, identity, and backup KEKs; old-key recovery; KEK rewrap; failure after old-key removal.
- Backup manifest, logical-dump digest, deletion-ledger digest, and ciphertext authentication.
- Audit-chain mutation detection and an HMAC checkpoint read from a separately created temporary anchor file.
- Deny-by-default simulated RBAC for all eight requested roles; all 54 prohibited role/operation combinations were exercised within the parameterized matrix.
- MySQL rejection of cross-survey question linkage, cross-response DEK ownership, duplicate response/question answers, sealed-version updates, unsafe active-wrap deletion, and failed-transaction remnants.
- MySQL role denials: public reader to confidential tables, ingestion to answer listing, backup operator to deletion.
- Required encrypted-answer indexes were found through `information_schema`.

## Backup/restore exercise

The final integration run:

1. Exported all three disposable schemas with `mysqldump --single-transaction --skip-lock-tables --set-gtid-purged=OFF --no-tablespaces --triggers`.
2. Kept the small logical dump in process memory and independently encrypted it with the backup-only hierarchy.
3. Verified the authenticated manifest and decrypted artifact.
4. Dropped only the three disposable schemas after disabling FK checks for the drop operation.
5. Restored through the MySQL client.
6. Replayed a synthetic post-backup identity-key deletion ledger.
7. Verified that identity ciphertext and wraps were absent and no encrypted answer was orphaned.

Final measured restore portion: **1846.18 ms**. Earlier successful iterations measured 3295.55 ms and 1924.98 ms. These tiny synthetic timings are not production RTO evidence.

## Incremental failures corrected

Failures are recorded rather than hidden:

1. PowerShell's default npm shim was not used because host execution policy blocks `npm.ps1`; `npm.cmd` was used without changing security policy.
2. `curl`/PowerShell TLS download methods failed in this sandbox. Node HTTPS downloaded the official archive, which was rejected unless its published checksum matched.
3. The first disposable server start used `skip-name-resolve`, preventing initialized `root@localhost` TCP access; the same disposable server was restarted without that option.
4. The first default unit run had one assertion expecting a different generic key-unavailability message; the fake provider was normalized to the single fail-closed unwrap error and the rerun passed.
5. MySQL integration iterations exposed and corrected cross-schema drop ordering, `information_schema` column-name casing, the default five-second test timeout, and a multi-table delete requiring a default database.
6. The final schema, grant, unit, integration, and build runs passed after these corrections.

## Dependency result

- Added one exact development dependency: `mysql2@3.24.6`.
- No production dependency was added; encryption uses Node.js `crypto`.
- `npm audit --omit=dev`: 0 vulnerabilities.
- Full `npm audit`: 16 moderate development-tool findings in the existing ESLint dependency chain; 0 high and 0 critical. Suggested automatic changes included incompatible/downgrade-looking versions, so no automatic or forced audit fix was applied.

## Skipped or unproven

- OCI networking, IAM, Vault, Object Storage, HeatWave and provider recovery.
- Verified MySQL TLS/CA/hostname failures; the local server was loopback-only and intentionally disposable.
- Cloudflare cache/WAF, DNS, origin restrictions and browser security flows.
- Real IdP, MFA, sessions, CSRF, production authorization middleware and administrative UI.
- Production-sized streaming backups, cross-region recovery, RPO/RTO, concurrent load and failure injection.
- Real personal, political-opinion or constituency records.
- Production deployment, migration, commit, push or merge.

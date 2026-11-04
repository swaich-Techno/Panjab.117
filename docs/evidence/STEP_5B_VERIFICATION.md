# Step 5B verification

**Scope:** Local, disposable MySQL 8.4 security verification using synthetic
data only

**Base:** `d208ed0ee884aa215f459b3ea5338947f4b15297`

**Branch:** `feat/step-5b-mysql-security-verification`

## Safety assertions

- Cloudflare Pages source and deployment configuration are unchanged.
- No API route, submission endpoint, production credential, database service,
  persistent browser storage or external AI integration was added.
- Survey launch approval and production security, privacy, consent,
  backup/recovery and operations approvals remain `false`.
- AI remains disabled. Only deterministic local code and synthetic fixtures are
  used.
- The database adapter and migration helper are under test-only security paths.
- The temporary MySQL server is loopback-only and is removed after verification.

## MySQL evidence summary

The executable suite covers exact MySQL version/bind/log settings; clean and
repeat migrations; checksum mismatch; implicit DDL commit and partial recovery;
schema indexes, nullability and foreign keys; atomic civic/political intake;
approval and political-consent denials; idempotency, duplicate and rate races;
rollback, real deadlock and uncertain commit; separate role permissions;
withdrawal attempt/expiry/concurrency; synthetic dump/restore and deletion
suppression replay.

## Commands

Final results recorded on 4 November 2026:

```text
npm run format:check       PASS — all matched files use Prettier style
npm run lint               PASS — 0 warnings, 0 errors
npm run typecheck          PASS — 0 TypeScript errors
npm run test               PASS — 20 files passed, 2 skipped;
                                  241 tests passed, 15 skipped
npm run test:security:intake
                           PASS — 3 files, 20 tests
npm run test:security:mysql
                           PASS — 2 files, 15 tests; synthetic restore
                                  timing 3823.13 ms
npm run build:cloudflare   PASS — 25 static pages generated; verifier found
                                  21 routes, 486 internal references,
                                  129 output files, 2 header rules,
                                  indexing disabled and no runtime functions
git diff --check           PASS — no whitespace errors
```

The 15 skips in the ordinary unit run are the 12 Step 5B and 3 pre-existing
MySQL integration tests because that command intentionally receives no
database environment variables. The separately configured disposable-MySQL
command executed and passed all 15. Vitest also printed an informational
worker-startup optimization suggestion; isolation remains enabled.

## Interim failures corrected

- The first MySQL run passed 13 of 15 tests. One deadlock fixture accidentally
  matched an earlier duplicate and the public-role assertion opened a default
  database before testing the denied query. Both fixtures were corrected.
- A later tightened run passed 14 of 15 tests. The remaining assertion expected
  a raw injected error even though the public intake boundary intentionally
  mapped it to `service_unavailable`; the assertion was corrected while the
  rollback row check remained.
- The first lint run found two unused type imports. They were removed; the final
  lint run has zero warnings.
- A parallel combined quality invocation exceeded its 120-second wrapper while
  lint was still running. Each required command was then rerun independently
  with a sufficient timeout and passed.

## Decision

This evidence advances the synthetic engineering foundation only. It is not a
production-readiness approval, does not activate survey intake, and does not
authorize deployment or confidential data collection.

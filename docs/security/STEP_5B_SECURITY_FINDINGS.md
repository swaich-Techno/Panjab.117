# Step 5B security findings

## Bounded fixes implemented

1. **Collection approval was only a boolean registry check.** Added a dedicated
   approval record with approver directory ID, authorization reference,
   approval/expiry/revocation timestamps and composite database binding to the
   response's questionnaire and notice digest.
2. **Political ciphertext was not database-bound to political consent.** Added
   a composite response/consent key and foreign key plus a true-only check.
3. **Ingestion and privacy grants were broader than necessary.** Replaced broad
   updates/reads with named-column grants and executable denied-path tests.
4. **Migration replay had no executable ledger.** Added SHA-256 tracked,
   repeat-safe disposable migration tooling and checksum mismatch detection.
5. **Step 5A's in-memory repository could not prove real transaction races.**
   Added a test-only MySQL repository and real concurrent, deadlock, rollback,
   uncertain-commit, withdrawal and restore tests.

The published Step 5A migrations were not rewritten; hardening is additive in
`0003_step_5b_verification_hardening.sql`.

## Unresolved risks

- The adapter and migration runner are test infrastructure, not production
  services. There is no public submission endpoint.
- The disposable server uses loopback plaintext and an empty root password;
  production TLS, private networking, managed secrets and administrator
  controls are not verified.
- Binary logging is enabled in the disposable runtime. Production log/binlog
  encryption, access, retention and deletion behavior need approval and tests.
- Ciphertext does not conceal all metadata: segment, locale, time, consent,
  version, key locator and operational status remain visible.
- Duplicate screening can produce false positives and needs human review,
  appeal, retention limits, bias assessment and rotation/destruction policy.
- Application authorization does not constrain database administrators.
- KMS/HSM behavior, external key destruction, production backup/PITR and
  suppression automation remain untested.
- Network partitions, mysqld crash/restart, replica failover, sustained load and
  disaster-scale recovery are not simulated.
- The collection approval row proves structural binding, not genuine production
  governance or identity assurance.

## Launch decision

Step 5B does not approve live collection. Survey launch approval and the five
operational approvals remain `false`; AI remains disabled. Production
credentials, infrastructure, endpoints, genuine responses and deployment are
outside scope.

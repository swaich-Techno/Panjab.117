# Secure submission verification

Status: local synthetic verification evidence is recorded by the final command
run; no production endpoint was exercised.

The imported Step 5A-5E test path covers the following design sequence:

1. Open the English questionnaire preview.
2. Select one eligible Assembly segment.
3. Read eligibility, information and consent.
4. Answer civic questions.
5. Accept or decline the optional political section.
6. Review answers.
7. Send only synthetic input to the loopback HTTPS harness.
8. Validate versions, consent, origin, input and age assertion.
9. Encrypt civic and political payloads with separated key purposes.
10. Commit response and audit/outbox atomically.
11. Return a receipt and withdrawal material.
12. Simulate a lost HTTP response.
13. Recover idempotently with retained recovery material.
14. Screen duplicates without storing raw fingerprint material.
15. Authorize a synthetic withdrawal.
16. Delete payload and retain limited audit/deletion evidence.
17. Restore an encrypted synthetic backup into quarantine.
18. Replay deletion suppression before release.
19. Derive constituency status counts.
20. Confirm the target itself does not reject 501 or 750.

Focused suites also cover malformed requests, approval failure, database
failure, transaction rollback, lost connectivity behavior, rate limiting,
concurrency, emergency stop, receipt recovery and screening cleanup.

Browser and disposable MySQL results must be reported separately. Previous
MySQL evidence is not treated as a fresh execution against this changed tree.

## Local results on 6 November 2026

- Full Vitest run: 292 passed; 15 skipped; zero failed.
- Intake-security suite: 51 passed.
- Step 5C suite: 18 passed.
- Step 5D suite: 42 passed.
- Step 5E suite: 14 passed.
- Target/admin suite: 9 passed, including loops that recorded 499, 500, 501
  and 750 valid synthetic submissions without target rejection.
- MySQL integration command: 15 skipped because no disposable server was
  active. No fresh real-MySQL claim is made for this integration tree.
- Cloudflare build: 7 English routes, 155 internal references, 60 output files,
  largest file 229,288 bytes, 2 header rules, indexing disabled and no runtime
  functions.
- Browser: all seven routes passed a fresh desktop check with no horizontal
  overflow; the earlier same-source true 390 × 844 emulated viewport check also
  passed. Root and both legacy-language redirect families passed; keyboard
  focus was visible; preview inspection produced no POST, cookie, localStorage
  or sessionStorage activity.

An initial attempt to run four Vitest commands concurrently exhausted the local
Node process memory. Each required command was then run independently and
passed. This was a runner resource issue, not an assertion failure.

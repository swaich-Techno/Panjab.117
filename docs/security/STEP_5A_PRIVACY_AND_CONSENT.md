# Step 5A privacy, consent and withdrawal

## Consent contract

Collection must remain blocked until the English, Punjabi and Hindi notices
receive independent linguistic, legal and privacy review. The accepted record
must pin the exact notice version and SHA-256 digest. Participation is
voluntary; optional questions may be skipped; civic participation and
political-opinion participation are separate choices. Political answers are
rejected unless separate consent is true.

The age policy is unresolved and therefore fails closed. A production service
must not substitute a checkbox for an approved eligibility and safeguarding
decision.

Retention duration, receipt expiry, privacy contact channel and escalation
path are not approved. Test values in local code are synthetic fixtures, not
policy.

## Data not collected

Do not collect name, phone, email, precise location, device/browser
fingerprint, advertising ID, persistent tracking ID or raw IP in a response
record. Abuse controls may use short-lived keyed signals outside the answer
record only after retention and privacy review. Such signals cannot establish
that two submissions are from one person.

## Withdrawal flow

1. After an accepted response, display a high-entropy random receipt once. Do
   not persist it in browser storage or logs.
2. Store only a keyed digest, key locator, issue/expiry times, attempt count and
   state.
3. Verify with constant-time comparison, bounded attempts and generic errors.
4. On verified withdrawal, atomically mark the response, remove civic and
   political payloads/wrapped data keys, and redeem the receipt.
5. Add a minimal deletion ledger entry so restored backups suppress the
   deleted record.
6. Complete and audit the case without copying answers into the audit trail.

Receipt reuse fails. Losing a receipt requires an approved alternate process;
none is invented here. The service must explain inability to locate a response
without encouraging collection of new identifiers.

## Reporting

Raw responses are never public. Published results must separate received,
included, pending-review and excluded totals; preserve missingness; apply
small-cell and complementary suppression; and state that voluntary responses
are not representative polling or election prediction.

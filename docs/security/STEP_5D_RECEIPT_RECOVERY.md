# Step 5D lost-receipt recovery

Before submission, the browser creates a fresh 256-bit random withdrawal secret. It is sent only in the request body, is never placed in local storage, session storage, cookies or logs, and is represented in storage only by an HMAC digest.

If the network response is lost, an exact retry uses both the original idempotency token and withdrawal secret. The server compares the stored and supplied digests in constant time. Only a match returns the original response ID and withdrawal secret. A mismatched or missing secret returns an unconfirmed replay with no sensitive receipt material.

## User limitations

- Refreshing or closing the page before saving the receipt loses the browser-held recovery material.
- Recovery is not an identity-recovery service and does not collect email, phone or another direct identifier.
- A new browser submission after losing both tokens may be retained for duplicate review; it cannot reveal the earlier receipt.
- Withdrawal codes expire, use bounded attempts and are single-use. Concurrent redemption is serialized by the durable adapter.

No receipt or response is persisted in the browser by this prototype.

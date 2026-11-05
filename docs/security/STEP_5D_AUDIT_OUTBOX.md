# Step 5D audit outbox

The intake transaction writes an answer-free outbox event in the same transaction as the response. The event contains identifiers, a fixed event type, a fixed outcome, scheduling state and retry metadata; it never contains answers, consent text, withdrawal secrets, IP addresses or browser fingerprints.

## Delivery model

1. A worker leases a bounded batch.
2. The idempotent sink deduplicates by a stable digest.
3. Successful delivery is acknowledged under lease ownership.
4. A crash after delivery but before acknowledgement causes redelivery; the sink treats it as already delivered.
5. Failures use bounded retries and then a visible dead-letter state.

Migration `0004_step_5d_audit_outbox.sql` separates ingestion, dispatch and screening-cleanup privileges. The test processor includes an explicit crash hook only for synthetic tests.

## Production requirements still open

- Select and independently review the durable audit service.
- Configure alerting for lease backlog, retry growth and dead letters.
- Approve event retention and destruction schedules.
- Prove recovery under managed MySQL failover and network partitions.
- Ensure operations staff cannot join audit metadata to raw answers without separately approved access.

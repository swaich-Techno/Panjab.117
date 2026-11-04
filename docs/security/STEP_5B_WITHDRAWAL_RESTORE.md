# Step 5B withdrawal and restore evidence

## Withdrawal behavior

Withdrawal verification locks the receipt row and parent response. The test
proved that two concurrent valid requests serialize: one completes deletion
and the other reports already redeemed. Invalid attempts increment durably and
lock after five failures; a subsequently valid code remains locked. Expired
codes fail closed.

Successful synthetic withdrawal deletes both civic and political ciphertext
rows, including their wrapped data keys, marks the response completed, and
writes ledger actions for civic-key destruction, political-key destruction and
backup suppression. Receipt codes themselves are never stored.

This proves database-row removal only. The in-memory key provider is not a KMS,
so external key destruction, rotation and cryptographic erasure remain
unverified production gates.

## Backup/restore exercise

The test took a consistent synthetic `mysqldump`, withdrew the response in the
source database, restored the older dump into a separate disposable schema,
confirmed the pre-withdrawal ciphertext reappeared, and then applied the live
deletion ledger before the restored database could be used. Both restored
payload partitions ended at zero rows.

This is evidence for the required suppression order, not a production restore
system. Production still requires encrypted backups, restricted backup
identity, tested PITR, an immutable deletion/suppression queue outside the
restored data set, KMS coordination, restore quarantine, reconciliation,
monitoring and formal RPO/RTO approval. No restored database may serve traffic
until suppression replay and verification complete.

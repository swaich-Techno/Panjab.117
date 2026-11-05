export const mysqlRegistrationTransactionPlan = {
  isolation: "READ COMMITTED",
  begin: "START TRANSACTION",
  lockApprovals:
    "SELECT * FROM registration_approval_gate WHERE singleton_id = 1 FOR UPDATE",
  findIdempotency:
    "SELECT registration_id, registration_status FROM synthetic_party_registration WHERE idempotency_key_hash = ?",
  findDuplicate:
    "SELECT registration_id, registration_status FROM synthetic_party_registration WHERE synthetic_participant_hash = ?",
  lockCapacity:
    "SELECT confirmed_count, capacity_limit FROM registration_capacity WHERE category_id = ? FOR UPDATE",
  insertRegistration:
    "INSERT INTO synthetic_party_registration (registration_id, category_id, party_option_id, assembly_constituency_id, idempotency_key_hash, synthetic_participant_hash, consent_version, registration_consent_at, political_opinion_consent_at, registration_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')",
  incrementCapacity:
    "UPDATE registration_capacity SET confirmed_count = confirmed_count + 1, revision = revision + 1 WHERE category_id = ? AND confirmed_count < capacity_limit",
  commit: "COMMIT",
  rollback: "ROLLBACK",
} as const;

export const mysqlWithdrawalTransactionPlan = {
  begin: "START TRANSACTION",
  lockRegistration:
    "SELECT registration_id, category_id, registration_status FROM synthetic_party_registration WHERE registration_id = ? FOR UPDATE",
  lockCapacity:
    "SELECT confirmed_count FROM registration_capacity WHERE category_id = ? FOR UPDATE",
  markWithdrawn:
    "UPDATE synthetic_party_registration SET registration_status = 'withdrawn', withdrawn_at = ? WHERE registration_id = ? AND registration_status = 'confirmed'",
  recordWithdrawal:
    "INSERT INTO synthetic_registration_withdrawal (withdrawal_id, registration_id, verified_at, capacity_released) VALUES (?, ?, ?, TRUE)",
  releaseCapacity:
    "UPDATE registration_capacity SET confirmed_count = confirmed_count - 1, revision = revision + 1 WHERE category_id = ? AND confirmed_count > 0",
  commit: "COMMIT",
  rollback: "ROLLBACK",
} as const;

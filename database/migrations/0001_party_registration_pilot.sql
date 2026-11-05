-- Panjab 117 synthetic party-registration prototype
-- MySQL 8.4 design only. Do not run against production without separate approval.
-- No credentials, personal data or real registrations are included.

CREATE TABLE IF NOT EXISTS registration_party_category (
  category_id VARCHAR(40) PRIMARY KEY,
  short_name VARCHAR(40) NOT NULL,
  display_name VARCHAR(160) NOT NULL,
  classification VARCHAR(80) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  capacity_limit SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  capacity_scope VARCHAR(100) NOT NULL,
  CHECK (capacity_limit > 0)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS registration_party_option (
  option_id VARCHAR(40) PRIMARY KEY,
  category_id VARCHAR(40) NOT NULL,
  short_name VARCHAR(40) NOT NULL,
  display_name VARCHAR(160) NOT NULL,
  classification VARCHAR(40) NOT NULL,
  CONSTRAINT fk_registration_option_category
    FOREIGN KEY (category_id)
    REFERENCES registration_party_category (category_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS registration_capacity (
  category_id VARCHAR(40) PRIMARY KEY,
  confirmed_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  capacity_limit SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  revision BIGINT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
    ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_registration_capacity_category
    FOREIGN KEY (category_id)
    REFERENCES registration_party_category (category_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT,
  CHECK (confirmed_count <= capacity_limit)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS synthetic_party_registration (
  registration_id BINARY(16) PRIMARY KEY,
  category_id VARCHAR(40) NOT NULL,
  party_option_id VARCHAR(40) NULL,
  assembly_constituency_id SMALLINT UNSIGNED NOT NULL,
  idempotency_key_hash BINARY(32) NOT NULL,
  synthetic_participant_hash BINARY(32) NOT NULL,
  consent_version VARCHAR(100) NOT NULL,
  registration_consent_at TIMESTAMP(6) NOT NULL,
  political_opinion_consent_at TIMESTAMP(6) NOT NULL,
  registration_status ENUM('confirmed', 'withdrawn') NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  withdrawn_at TIMESTAMP(6) NULL,
  UNIQUE KEY uq_registration_idempotency (idempotency_key_hash),
  UNIQUE KEY uq_registration_synthetic_participant (synthetic_participant_hash),
  KEY ix_registration_category_status (category_id, registration_status),
  CONSTRAINT fk_registration_category
    FOREIGN KEY (category_id)
    REFERENCES registration_party_category (category_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT,
  CONSTRAINT fk_registration_party_option
    FOREIGN KEY (party_option_id)
    REFERENCES registration_party_option (option_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT,
  CHECK (
    assembly_constituency_id IN (54, 55, 56, 57, 58, 59, 67, 69, 106)
  )
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS synthetic_registration_withdrawal (
  withdrawal_id BINARY(16) PRIMARY KEY,
  registration_id BINARY(16) NOT NULL,
  verified_at TIMESTAMP(6) NOT NULL,
  capacity_released BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_withdrawal_registration (registration_id),
  CONSTRAINT fk_withdrawal_registration
    FOREIGN KEY (registration_id)
    REFERENCES synthetic_party_registration (registration_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS candidate_directory_record (
  candidate_record_id BINARY(16) PRIMARY KEY,
  record_version VARCHAR(100) NOT NULL,
  assembly_constituency_id SMALLINT UNSIGNED NOT NULL,
  assembly_constituency_name VARCHAR(160) NOT NULL,
  party_or_organisation_id VARCHAR(40) NOT NULL,
  candidate_full_name VARCHAR(200) NOT NULL,
  announcement_status VARCHAR(60) NOT NULL,
  announcement_date DATE NULL,
  source_url VARCHAR(1000) NOT NULL,
  last_verification_date DATE NOT NULL,
  uncertainty_notes TEXT NOT NULL,
  UNIQUE KEY uq_candidate_version (
    record_version,
    assembly_constituency_id,
    party_or_organisation_id
  )
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS candidate_status_history (
  history_id BINARY(16) PRIMARY KEY,
  candidate_record_id BINARY(16) NOT NULL,
  announcement_status VARCHAR(60) NOT NULL,
  effective_date DATE NOT NULL,
  source_url VARCHAR(1000) NOT NULL,
  status_note TEXT NOT NULL,
  recorded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_candidate_history_record
    FOREIGN KEY (candidate_record_id)
    REFERENCES candidate_directory_record (candidate_record_id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS registration_approval_gate (
  singleton_id TINYINT UNSIGNED PRIMARY KEY,
  final_launch_approved BOOLEAN NOT NULL DEFAULT FALSE,
  production_security_approved BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_approved BOOLEAN NOT NULL DEFAULT FALSE,
  consent_approved BOOLEAN NOT NULL DEFAULT FALSE,
  backup_recovery_approved BOOLEAN NOT NULL DEFAULT FALSE,
  operations_approved BOOLEAN NOT NULL DEFAULT FALSE,
  public_registration_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  emergency_stop_active BOOLEAN NOT NULL DEFAULT TRUE,
  CHECK (singleton_id = 1)
) ENGINE = InnoDB;

INSERT INTO registration_approval_gate (singleton_id)
VALUES (1)
ON DUPLICATE KEY UPDATE singleton_id = VALUES(singleton_id);

-- Required application transaction for a registration attempt:
-- 1. START TRANSACTION at READ COMMITTED or stronger isolation.
-- 2. Read registration_approval_gate FOR UPDATE and fail unless every gate is
--    approved, public registration is enabled and emergency stop is false.
-- 3. Resolve idempotency_key_hash and synthetic_participant_hash under their
--    unique constraints. An exact retry returns the original result; a
--    conflicting reuse fails.
-- 4. Lock the category row in registration_capacity with SELECT ... FOR UPDATE.
-- 5. Reject when confirmed_count >= capacity_limit.
-- 6. Insert the confirmed registration and increment confirmed_count in the
--    same transaction. Commit only if both writes succeed.
-- 7. On any error, ROLLBACK. Never increment capacity separately.
--
-- Withdrawal uses the same category-row lock. It changes confirmed to
-- withdrawn, records a verified withdrawal and decrements confirmed_count in
-- one transaction. The participant hash remains uniquely suppressed so a
-- withdrawal cannot be used to create repeated registrations automatically.

-- Panjab 117 Step 5A design migration. DO NOT apply to a live system yet.
-- Requires MySQL 8.4. No credentials or real participant data belong here.

CREATE TABLE survey_questionnaire_versions (
  version_id VARCHAR(96) PRIMARY KEY,
  definition_sha256 BINARY(32) NOT NULL UNIQUE,
  approved_for_collection BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP(6) NOT NULL,
  CHECK (approved_for_collection IN (FALSE, TRUE))
) ENGINE = InnoDB;

CREATE TABLE survey_consent_notice_versions (
  version_id VARCHAR(96) PRIMARY KEY,
  notice_sha256 BINARY(32) NOT NULL UNIQUE,
  translation_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  legal_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  approved_for_collection BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP(6) NOT NULL,
  CHECK (translation_reviewed IN (FALSE, TRUE)),
  CHECK (legal_reviewed IN (FALSE, TRUE)),
  CHECK (approved_for_collection IN (FALSE, TRUE))
) ENGINE = InnoDB;

CREATE TABLE survey_responses (
  response_id BINARY(16) PRIMARY KEY,
  questionnaire_version_id VARCHAR(96) NOT NULL,
  consent_notice_version_id VARCHAR(96) NOT NULL,
  consent_notice_sha256 BINARY(32) NOT NULL,
  assembly_segment_number SMALLINT UNSIGNED NOT NULL,
  locale ENUM('en', 'pa', 'hi') NOT NULL,
  civic_consent BOOLEAN NOT NULL,
  political_consent BOOLEAN NOT NULL,
  submitted_at TIMESTAMP(6) NOT NULL,
  quality_status ENUM(
    'included',
    'pending_duplicate_review',
    'confirmed_duplicate',
    'excluded_other_documented_reason'
  ) NOT NULL DEFAULT 'included',
  withdrawal_state ENUM(
    'active',
    'verification_pending',
    'approved',
    'live_data_deleted',
    'backup_suppression_recorded',
    'completed'
  ) NOT NULL DEFAULT 'active',
  synthetic_only BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_response_questionnaire
    FOREIGN KEY (questionnaire_version_id)
    REFERENCES survey_questionnaire_versions (version_id),
  CONSTRAINT fk_response_notice
    FOREIGN KEY (consent_notice_version_id)
    REFERENCES survey_consent_notice_versions (version_id),
  CHECK (assembly_segment_number IN (54, 55, 56, 57, 58, 59, 67, 69, 106)),
  CHECK (civic_consent = TRUE),
  CHECK (political_consent IN (FALSE, TRUE)),
  CHECK (synthetic_only IN (FALSE, TRUE))
) ENGINE = InnoDB;

CREATE TABLE survey_civic_payloads (
  response_id BINARY(16) PRIMARY KEY,
  envelope_version TINYINT UNSIGNED NOT NULL,
  algorithm VARCHAR(32) NOT NULL,
  data_key_id BINARY(16) NOT NULL UNIQUE,
  key_locator VARCHAR(255) NOT NULL,
  key_version INT UNSIGNED NOT NULL,
  wrapped_key JSON NOT NULL,
  encrypted_payload JSON NOT NULL,
  created_at TIMESTAMP(6) NOT NULL,
  CONSTRAINT fk_civic_response FOREIGN KEY (response_id)
    REFERENCES survey_responses (response_id) ON DELETE CASCADE,
  CHECK (envelope_version = 1),
  CHECK (algorithm = 'aes-256-gcm')
) ENGINE = InnoDB;

CREATE TABLE survey_political_payloads (
  response_id BINARY(16) PRIMARY KEY,
  envelope_version TINYINT UNSIGNED NOT NULL,
  algorithm VARCHAR(32) NOT NULL,
  data_key_id BINARY(16) NOT NULL UNIQUE,
  key_locator VARCHAR(255) NOT NULL,
  key_version INT UNSIGNED NOT NULL,
  wrapped_key JSON NOT NULL,
  encrypted_payload JSON NOT NULL,
  created_at TIMESTAMP(6) NOT NULL,
  CONSTRAINT fk_political_response FOREIGN KEY (response_id)
    REFERENCES survey_responses (response_id) ON DELETE CASCADE,
  CHECK (envelope_version = 1),
  CHECK (algorithm = 'aes-256-gcm')
) ENGINE = InnoDB;

CREATE TABLE survey_screening_claims (
  claim_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  domain ENUM('idempotency', 'answer_duplicate', 'rate_limit') NOT NULL,
  screening_key_id VARCHAR(96) NOT NULL,
  signal_digest BINARY(32) NOT NULL,
  response_id BINARY(16) NULL,
  claim_count INT UNSIGNED NOT NULL DEFAULT 1,
  window_start TIMESTAMP(6) NOT NULL,
  window_end TIMESTAMP(6) NOT NULL,
  last_seen_at TIMESTAMP(6) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL,
  UNIQUE KEY uq_screening_claim (domain, screening_key_id, signal_digest, window_start),
  KEY ix_screening_response (response_id),
  CONSTRAINT fk_screening_response FOREIGN KEY (response_id)
    REFERENCES survey_responses (response_id) ON DELETE SET NULL,
  CHECK (window_end > window_start),
  CHECK (last_seen_at >= window_start AND last_seen_at < window_end),
  CHECK (claim_count >= 1)
) ENGINE = InnoDB;

CREATE TABLE survey_withdrawal_receipts (
  response_id BINARY(16) PRIMARY KEY,
  receipt_digest BINARY(32) NOT NULL UNIQUE,
  key_locator VARCHAR(255) NOT NULL,
  issued_at TIMESTAMP(6) NOT NULL,
  expires_at TIMESTAMP(6) NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts TINYINT UNSIGNED NOT NULL,
  status ENUM('active', 'redeemed', 'expired', 'locked') NOT NULL,
  CONSTRAINT fk_withdrawal_response FOREIGN KEY (response_id)
    REFERENCES survey_responses (response_id) ON DELETE CASCADE,
  CHECK (expires_at > issued_at),
  CHECK (max_attempts BETWEEN 1 AND 10),
  CHECK (attempts <= max_attempts)
) ENGINE = InnoDB;

CREATE TABLE survey_deletion_ledger (
  deletion_id BINARY(16) PRIMARY KEY,
  response_id BINARY(16) NOT NULL,
  action ENUM(
    'destroy_answer_key',
    'destroy_political_answer_key',
    'backup_suppression_recorded'
  ) NOT NULL,
  recorded_at TIMESTAMP(6) NOT NULL,
  completed_at TIMESTAMP(6) NULL,
  UNIQUE KEY uq_deletion_action (response_id, action)
) ENGINE = InnoDB;

CREATE TABLE survey_access_audit (
  audit_id BINARY(16) PRIMARY KEY,
  actor_directory_id BINARY(16) NOT NULL,
  actor_role VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL,
  response_id BINARY(16) NULL,
  approval_id BINARY(16) NULL,
  outcome ENUM('allowed', 'denied') NOT NULL,
  occurred_at TIMESTAMP(6) NOT NULL,
  metadata JSON NOT NULL,
  KEY ix_audit_response_time (response_id, occurred_at)
) ENGINE = InnoDB;

CREATE TABLE survey_export_approvals (
  approval_id BINARY(16) PRIMARY KEY,
  purpose VARCHAR(255) NOT NULL,
  dataset_classification ENUM('deidentified', 'civic_raw', 'political_raw') NOT NULL,
  approved_by_directory_id BINARY(16) NOT NULL,
  approved_at TIMESTAMP(6) NOT NULL,
  expires_at TIMESTAMP(6) NOT NULL,
  used_at TIMESTAMP(6) NULL,
  CHECK (expires_at > approved_at)
) ENGINE = InnoDB;

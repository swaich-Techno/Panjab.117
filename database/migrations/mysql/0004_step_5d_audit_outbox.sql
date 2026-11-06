-- Panjab 117 Step 5D additive reliability hardening.
-- Test-only until production architecture, roles and retention are approved.
-- This migration is intentionally rerunnable after partial MySQL DDL failure.

CREATE TABLE IF NOT EXISTS survey_audit_outbox (
  event_id BINARY(16) PRIMARY KEY,
  response_id BINARY(16) NULL,
  event_type ENUM(
    'intake_committed',
    'screening_cleanup_completed',
    'withdrawal_completed'
  ) NOT NULL,
  outcome ENUM(
    'response_accepted_and_stored',
    'response_retained_for_duplicate_review',
    'screening_cleanup_completed',
    'withdrawal_completed'
  ) NOT NULL,
  dedupe_key BINARY(32) NOT NULL UNIQUE,
  state ENUM('pending', 'leased', 'delivered', 'dead_letter') NOT NULL DEFAULT 'pending',
  attempt_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 5,
  available_at TIMESTAMP(6) NOT NULL,
  lease_owner VARCHAR(96) NULL,
  lease_expires_at TIMESTAMP(6) NULL,
  last_error_code VARCHAR(64) NULL,
  created_at TIMESTAMP(6) NOT NULL,
  delivered_at TIMESTAMP(6) NULL,
  CONSTRAINT fk_outbox_response FOREIGN KEY (response_id)
    REFERENCES survey_responses (response_id) ON DELETE SET NULL,
  KEY ix_outbox_dispatch (state, available_at, event_id),
  CHECK (attempt_count <= max_attempts),
  CHECK (max_attempts BETWEEN 1 AND 20),
  CHECK (
    (state = 'leased' AND lease_owner IS NOT NULL AND lease_expires_at IS NOT NULL)
    OR (state <> 'leased')
  ),
  CHECK (delivered_at IS NULL OR state = 'delivered')
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS survey_screening_cleanup_runs (
  cleanup_id BINARY(16) PRIMARY KEY,
  policy_id VARCHAR(128) NOT NULL,
  policy_version INT UNSIGNED NOT NULL,
  cutoff_at TIMESTAMP(6) NOT NULL,
  deleted_claim_count INT UNSIGNED NOT NULL,
  ran_at TIMESTAMP(6) NOT NULL,
  synthetic_only BOOLEAN NOT NULL DEFAULT TRUE,
  CHECK (policy_version >= 1),
  CHECK (synthetic_only IN (FALSE, TRUE))
) ENGINE = InnoDB;

CREATE ROLE IF NOT EXISTS
  'p117_audit_dispatcher',
  'p117_screening_cleanup';

GRANT INSERT (
    event_id,
    response_id,
    event_type,
    outcome,
    dedupe_key,
    max_attempts,
    available_at,
    created_at
  ) ON panjab117.survey_audit_outbox TO 'p117_survey_ingest';

GRANT SELECT ON panjab117.survey_audit_outbox TO 'p117_audit_dispatcher';
GRANT UPDATE (
    state,
    attempt_count,
    available_at,
    lease_owner,
    lease_expires_at,
    last_error_code,
    delivered_at
  ) ON panjab117.survey_audit_outbox TO 'p117_audit_dispatcher';

GRANT SELECT, DELETE ON panjab117.survey_screening_claims TO 'p117_screening_cleanup';
GRANT INSERT ON panjab117.survey_screening_cleanup_runs TO 'p117_screening_cleanup';
GRANT INSERT (
    event_id,
    response_id,
    event_type,
    outcome,
    dedupe_key,
    max_attempts,
    available_at,
    created_at
  ) ON panjab117.survey_audit_outbox TO 'p117_screening_cleanup';

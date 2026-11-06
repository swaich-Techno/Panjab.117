-- Panjab 117 Step 5B additive hardening. Apply only after 0001 and 0002.
-- MySQL DDL implicitly commits. Use schema_migrations and documented recovery;
-- ordinary ROLLBACK does not reverse a partially applied schema migration.

ALTER TABLE survey_consent_notice_versions
  ADD UNIQUE KEY uq_consent_notice_version_digest (version_id, notice_sha256);

CREATE TABLE survey_collection_approvals (
  approval_id BINARY(16) PRIMARY KEY,
  questionnaire_version_id VARCHAR(96) NOT NULL,
  consent_notice_version_id VARCHAR(96) NOT NULL,
  consent_notice_sha256 BINARY(32) NOT NULL,
  authorization_reference VARCHAR(128) NOT NULL UNIQUE,
  approved_by_directory_id BINARY(16) NOT NULL,
  approved_at TIMESTAMP(6) NOT NULL,
  expires_at TIMESTAMP(6) NOT NULL,
  revoked_at TIMESTAMP(6) NULL,
  UNIQUE KEY uq_collection_approval_binding (
    approval_id,
    questionnaire_version_id,
    consent_notice_version_id,
    consent_notice_sha256
  ),
  CONSTRAINT fk_collection_approval_questionnaire
    FOREIGN KEY (questionnaire_version_id)
    REFERENCES survey_questionnaire_versions (version_id),
  CONSTRAINT fk_collection_approval_notice
    FOREIGN KEY (consent_notice_version_id, consent_notice_sha256)
    REFERENCES survey_consent_notice_versions (version_id, notice_sha256),
  CHECK (expires_at > approved_at),
  CHECK (revoked_at IS NULL OR revoked_at >= approved_at)
) ENGINE = InnoDB;

ALTER TABLE survey_responses
  ADD COLUMN collection_approval_id BINARY(16) NULL AFTER response_id,
  ADD UNIQUE KEY uq_response_political_consent (
    response_id,
    political_consent
  ),
  ADD CONSTRAINT fk_response_collection_approval
    FOREIGN KEY (
      collection_approval_id,
      questionnaire_version_id,
      consent_notice_version_id,
      consent_notice_sha256
    ) REFERENCES survey_collection_approvals (
      approval_id,
      questionnaire_version_id,
      consent_notice_version_id,
      consent_notice_sha256
    );

ALTER TABLE survey_responses
  MODIFY COLUMN collection_approval_id BINARY(16) NOT NULL;

ALTER TABLE survey_political_payloads
  ADD COLUMN political_consent BOOLEAN NOT NULL DEFAULT TRUE AFTER response_id,
  ADD CONSTRAINT fk_political_response_consent
    FOREIGN KEY (response_id, political_consent)
    REFERENCES survey_responses (response_id, political_consent),
  ADD CHECK (political_consent = TRUE);

GRANT SELECT ON panjab117.survey_collection_approvals TO 'p117_survey_ingest';

REVOKE UPDATE ON panjab117.survey_screening_claims FROM 'p117_survey_ingest';
GRANT UPDATE (claim_count, last_seen_at, response_id)
  ON panjab117.survey_screening_claims TO 'p117_survey_ingest';

REVOKE SELECT, UPDATE ON panjab117.survey_responses FROM 'p117_privacy_officer';
GRANT SELECT (response_id, withdrawal_state), UPDATE (withdrawal_state)
  ON panjab117.survey_responses TO 'p117_privacy_officer';

REVOKE SELECT, UPDATE ON panjab117.survey_withdrawal_receipts FROM 'p117_privacy_officer';
GRANT SELECT (
    response_id,
    receipt_digest,
    key_locator,
    issued_at,
    expires_at,
    attempts,
    max_attempts,
    status
  ), UPDATE (attempts, status)
  ON panjab117.survey_withdrawal_receipts TO 'p117_privacy_officer';

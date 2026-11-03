-- Panjab 117 Step 2A logical schema draft.
-- DESIGN ONLY: do not execute. No credentials, grants, migrations, or real data.
-- Requires review against the exact managed MySQL version before implementation.

CREATE SCHEMA IF NOT EXISTS panjab_public
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE SCHEMA IF NOT EXISTS panjab_confidential
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE SCHEMA IF NOT EXISTS panjab_security
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE panjab_public.constituencies (
  id BINARY(16) NOT NULL,
  official_number SMALLINT UNSIGNED NOT NULL,
  slug VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  lifecycle_status VARCHAR(24) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_constituency_number (official_number),
  UNIQUE KEY uq_constituency_slug (slug),
  CONSTRAINT chk_constituency_number CHECK (official_number BETWEEN 1 AND 117),
  CONSTRAINT chk_constituency_status CHECK (lifecycle_status IN ('draft','verified','retired'))
) ENGINE=InnoDB;

CREATE TABLE panjab_security.admin_identities (
  id BINARY(16) NOT NULL,
  idp_subject_digest BINARY(32) NOT NULL,
  display_label VARCHAR(120) NULL,
  status VARCHAR(20) NOT NULL,
  mfa_assurance_required VARCHAR(40) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  disabled_at TIMESTAMP(6) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_idp_subject (idp_subject_digest),
  CONSTRAINT chk_admin_status CHECK (status IN ('invited','active','suspended','disabled'))
) ENGINE=InnoDB;

CREATE TABLE panjab_security.roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  description VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_role_code (role_code)
) ENGINE=InnoDB;

CREATE TABLE panjab_security.permissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  permission_code VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  description VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_permission_code (permission_code)
) ENGINE=InnoDB;

CREATE TABLE panjab_security.role_permissions (
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) REFERENCES panjab_security.roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission_id) REFERENCES panjab_security.permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE panjab_security.admin_role_assignments (
  id BINARY(16) NOT NULL,
  admin_identity_id BINARY(16) NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  scope_type VARCHAR(32) NOT NULL DEFAULT 'global',
  scope_id BINARY(16) NULL,
  scope_key BINARY(16) GENERATED ALWAYS AS (IFNULL(scope_id, 0x00000000000000000000000000000000)) STORED,
  assigned_by BINARY(16) NOT NULL,
  assigned_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  expires_at TIMESTAMP(6) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_role_assignment_scope (admin_identity_id, role_id, scope_type, scope_key),
  KEY idx_role_assignment_expiry (expires_at),
  CONSTRAINT fk_assignment_admin FOREIGN KEY (admin_identity_id) REFERENCES panjab_security.admin_identities(id),
  CONSTRAINT fk_assignment_role FOREIGN KEY (role_id) REFERENCES panjab_security.roles(id),
  CONSTRAINT fk_assignment_actor FOREIGN KEY (assigned_by) REFERENCES panjab_security.admin_identities(id),
  CONSTRAINT chk_assignment_scope CHECK ((scope_type = 'global' AND scope_id IS NULL) OR (scope_type <> 'global' AND scope_id IS NOT NULL))
) ENGINE=InnoDB;

CREATE TABLE panjab_public.constituency_content_versions (
  id BINARY(16) NOT NULL,
  constituency_id BINARY(16) NOT NULL,
  locale CHAR(2) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  version_number INT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  summary TEXT NOT NULL,
  body LONGTEXT NOT NULL,
  workflow_status VARCHAR(24) NOT NULL,
  authored_by BINARY(16) NOT NULL,
  published_at TIMESTAMP(6) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_constituency_locale_version (constituency_id, locale, version_number),
  KEY idx_constituency_published (constituency_id, locale, workflow_status, published_at),
  CONSTRAINT fk_content_constituency FOREIGN KEY (constituency_id) REFERENCES panjab_public.constituencies(id),
  CONSTRAINT fk_content_author FOREIGN KEY (authored_by) REFERENCES panjab_security.admin_identities(id),
  CONSTRAINT chk_content_locale CHECK (locale IN ('en','pa','hi')),
  CONSTRAINT chk_content_status CHECK (workflow_status IN ('draft','review','approved','published','superseded','withdrawn'))
) ENGINE=InnoDB;

CREATE TABLE panjab_public.research_sources (
  id BINARY(16) NOT NULL,
  source_type VARCHAR(32) NOT NULL,
  title VARCHAR(500) NOT NULL,
  publisher VARCHAR(255) NULL,
  canonical_url VARCHAR(2048) NULL,
  archived_url VARCHAR(2048) NULL,
  published_on DATE NULL,
  accessed_on DATE NOT NULL,
  content_sha256 BINARY(32) NULL,
  verification_status VARCHAR(24) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_source_verification (verification_status, accessed_on)
) ENGINE=InnoDB;

CREATE TABLE panjab_public.research_reports (
  id BINARY(16) NOT NULL,
  slug VARCHAR(120) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  lifecycle_status VARCHAR(24) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_report_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE panjab_public.research_report_versions (
  id BINARY(16) NOT NULL,
  report_id BINARY(16) NOT NULL,
  locale CHAR(2) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  version_number INT UNSIGNED NOT NULL,
  title VARCHAR(300) NOT NULL,
  abstract TEXT NOT NULL,
  body LONGTEXT NOT NULL,
  workflow_status VARCHAR(24) NOT NULL,
  authored_by BINARY(16) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  published_at TIMESTAMP(6) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_report_locale_version (report_id, locale, version_number),
  CONSTRAINT fk_report_version_report FOREIGN KEY (report_id) REFERENCES panjab_public.research_reports(id),
  CONSTRAINT fk_report_version_author FOREIGN KEY (authored_by) REFERENCES panjab_security.admin_identities(id),
  CONSTRAINT chk_report_locale CHECK (locale IN ('en','pa','hi'))
) ENGINE=InnoDB;

CREATE TABLE panjab_public.citations (
  id BINARY(16) NOT NULL,
  source_id BINARY(16) NOT NULL,
  report_version_id BINARY(16) NULL,
  constituency_content_version_id BINARY(16) NULL,
  locator VARCHAR(255) NULL,
  quotation_sha256 BINARY(32) NULL,
  verification_status VARCHAR(24) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_citation_source (source_id),
  KEY idx_citation_report (report_version_id),
  KEY idx_citation_constituency_content (constituency_content_version_id),
  CONSTRAINT fk_citation_source FOREIGN KEY (source_id) REFERENCES panjab_public.research_sources(id),
  CONSTRAINT fk_citation_report FOREIGN KEY (report_version_id) REFERENCES panjab_public.research_report_versions(id),
  CONSTRAINT fk_citation_content FOREIGN KEY (constituency_content_version_id) REFERENCES panjab_public.constituency_content_versions(id),
  CONSTRAINT chk_citation_one_target CHECK ((report_version_id IS NOT NULL) + (constituency_content_version_id IS NOT NULL) = 1)
) ENGINE=InnoDB;

CREATE TABLE panjab_public.verification_events (
  id BINARY(16) NOT NULL,
  source_id BINARY(16) NULL,
  target_type VARCHAR(40) NOT NULL,
  target_id BINARY(16) NOT NULL,
  outcome VARCHAR(24) NOT NULL,
  notes VARCHAR(1000) NULL,
  verified_by BINARY(16) NOT NULL,
  verified_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_verification_target (target_type, target_id, verified_at),
  CONSTRAINT fk_verification_source FOREIGN KEY (source_id) REFERENCES panjab_public.research_sources(id),
  CONSTRAINT fk_verification_actor FOREIGN KEY (verified_by) REFERENCES panjab_security.admin_identities(id)
) ENGINE=InnoDB;

CREATE TABLE panjab_public.correction_records (
  id BINARY(16) NOT NULL,
  target_type VARCHAR(40) NOT NULL,
  target_version_id BINARY(16) NOT NULL,
  superseding_version_id BINARY(16) NULL,
  reason_code VARCHAR(40) NOT NULL,
  public_note TEXT NOT NULL,
  approved_by BINARY(16) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_correction_target (target_type, target_version_id),
  CONSTRAINT fk_correction_approver FOREIGN KEY (approved_by) REFERENCES panjab_security.admin_identities(id)
) ENGINE=InnoDB;

CREATE TABLE panjab_public.survey_definitions (
  id BINARY(16) NOT NULL,
  survey_code VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  lifecycle_status VARCHAR(24) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_survey_code (survey_code)
) ENGINE=InnoDB;

CREATE TABLE panjab_public.survey_versions (
  id BINARY(16) NOT NULL,
  survey_id BINARY(16) NOT NULL,
  version_number INT UNSIGNED NOT NULL,
  privacy_notice_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  workflow_status VARCHAR(24) NOT NULL,
  opens_at TIMESTAMP(6) NULL,
  closes_at TIMESTAMP(6) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_survey_version (survey_id, version_number),
  KEY idx_survey_window (workflow_status, opens_at, closes_at),
  CONSTRAINT fk_survey_version_survey FOREIGN KEY (survey_id) REFERENCES panjab_public.survey_definitions(id),
  CONSTRAINT chk_survey_window CHECK (closes_at IS NULL OR opens_at IS NULL OR closes_at > opens_at)
) ENGINE=InnoDB;

CREATE TABLE panjab_public.survey_questions (
  id BINARY(16) NOT NULL,
  survey_version_id BINARY(16) NOT NULL,
  question_code VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  question_type VARCHAR(32) NOT NULL,
  sensitivity_class VARCHAR(24) NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  display_order SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_question_code (survey_version_id, question_code),
  UNIQUE KEY uq_question_order (survey_version_id, display_order),
  CONSTRAINT fk_question_survey_version FOREIGN KEY (survey_version_id) REFERENCES panjab_public.survey_versions(id)
) ENGINE=InnoDB;

CREATE TABLE panjab_public.survey_question_localizations (
  question_id BINARY(16) NOT NULL,
  locale CHAR(2) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  prompt TEXT NOT NULL,
  help_text TEXT NULL,
  PRIMARY KEY (question_id, locale),
  CONSTRAINT fk_question_localization_question FOREIGN KEY (question_id) REFERENCES panjab_public.survey_questions(id) ON DELETE CASCADE,
  CONSTRAINT chk_question_locale CHECK (locale IN ('en','pa','hi'))
) ENGINE=InnoDB;

CREATE TABLE panjab_public.survey_options (
  id BINARY(16) NOT NULL,
  question_id BINARY(16) NOT NULL,
  option_code VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  display_order SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_option_code (question_id, option_code),
  UNIQUE KEY uq_option_order (question_id, display_order),
  CONSTRAINT fk_option_question FOREIGN KEY (question_id) REFERENCES panjab_public.survey_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE panjab_public.survey_option_localizations (
  option_id BINARY(16) NOT NULL,
  locale CHAR(2) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  label VARCHAR(500) NOT NULL,
  PRIMARY KEY (option_id, locale),
  CONSTRAINT fk_option_localization_option FOREIGN KEY (option_id) REFERENCES panjab_public.survey_options(id) ON DELETE CASCADE,
  CONSTRAINT chk_option_locale CHECK (locale IN ('en','pa','hi'))
) ENGINE=InnoDB;

CREATE TABLE panjab_confidential.response_sessions (
  id BINARY(16) NOT NULL,
  survey_version_id BINARY(16) NOT NULL,
  response_status VARCHAR(24) NOT NULL,
  retention_expires_at TIMESTAMP(6) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  submitted_at TIMESTAMP(6) NULL,
  PRIMARY KEY (id),
  KEY idx_response_retention (response_status, retention_expires_at),
  KEY idx_response_survey (survey_version_id, submitted_at),
  CONSTRAINT fk_response_survey_version FOREIGN KEY (survey_version_id) REFERENCES panjab_public.survey_versions(id),
  CONSTRAINT chk_response_status CHECK (response_status IN ('started','submitted','withdrawal_pending','deleted','quarantined'))
) ENGINE=InnoDB;

CREATE TABLE panjab_confidential.consent_purposes (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  purpose_code VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  description VARCHAR(500) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_consent_purpose_code (purpose_code)
) ENGINE=InnoDB;

CREATE TABLE panjab_confidential.consent_records (
  id BINARY(16) NOT NULL,
  response_id BINARY(16) NOT NULL,
  notice_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  event_type VARCHAR(16) NOT NULL,
  collection_channel VARCHAR(32) NOT NULL,
  evidence_sha256 BINARY(32) NOT NULL,
  recorded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_consent_response_time (response_id, recorded_at),
  CONSTRAINT fk_consent_response FOREIGN KEY (response_id) REFERENCES panjab_confidential.response_sessions(id),
  CONSTRAINT chk_consent_event CHECK (event_type IN ('granted','withdrawn'))
) ENGINE=InnoDB;

CREATE TABLE panjab_confidential.consent_record_purposes (
  consent_record_id BINARY(16) NOT NULL,
  consent_purpose_id SMALLINT UNSIGNED NOT NULL,
  is_granted BOOLEAN NOT NULL,
  PRIMARY KEY (consent_record_id, consent_purpose_id),
  CONSTRAINT fk_consent_link_record FOREIGN KEY (consent_record_id) REFERENCES panjab_confidential.consent_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_consent_link_purpose FOREIGN KEY (consent_purpose_id) REFERENCES panjab_confidential.consent_purposes(id)
) ENGINE=InnoDB;

CREATE TABLE panjab_security.encryption_key_versions (
  id BINARY(16) NOT NULL,
  key_alias VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  key_reference_digest BINARY(32) NOT NULL,
  purpose VARCHAR(40) NOT NULL,
  lifecycle_status VARCHAR(20) NOT NULL,
  activated_at TIMESTAMP(6) NOT NULL,
  retired_at TIMESTAMP(6) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_key_reference_digest (key_reference_digest),
  CONSTRAINT chk_key_status CHECK (lifecycle_status IN ('pending','active','decrypt_only','retired','compromised'))
) ENGINE=InnoDB;

CREATE TABLE panjab_confidential.encrypted_data_keys (
  id BINARY(16) NOT NULL,
  key_version_id BINARY(16) NOT NULL,
  wrapped_dek VARBINARY(1024) NOT NULL,
  wrapping_algorithm VARCHAR(40) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_dek_key_version (key_version_id),
  CONSTRAINT fk_dek_key_version FOREIGN KEY (key_version_id) REFERENCES panjab_security.encryption_key_versions(id)
) ENGINE=InnoDB;

CREATE TABLE panjab_confidential.encrypted_answers (
  id BINARY(16) NOT NULL,
  response_id BINARY(16) NOT NULL,
  question_id BINARY(16) NOT NULL,
  encrypted_data_key_id BINARY(16) NOT NULL,
  ciphertext MEDIUMBLOB NOT NULL,
  nonce BINARY(12) NOT NULL,
  auth_tag BINARY(16) NOT NULL,
  aad_version SMALLINT UNSIGNED NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_answer_response_question (response_id, question_id),
  CONSTRAINT fk_answer_response FOREIGN KEY (response_id) REFERENCES panjab_confidential.response_sessions(id),
  CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES panjab_public.survey_questions(id),
  CONSTRAINT fk_answer_dek FOREIGN KEY (encrypted_data_key_id) REFERENCES panjab_confidential.encrypted_data_keys(id)
) ENGINE=InnoDB;

CREATE TABLE panjab_confidential.response_identities (
  response_id BINARY(16) NOT NULL,
  encrypted_data_key_id BINARY(16) NOT NULL,
  identity_ciphertext BLOB NOT NULL,
  nonce BINARY(12) NOT NULL,
  auth_tag BINARY(16) NOT NULL,
  aad_version SMALLINT UNSIGNED NOT NULL,
  retention_expires_at TIMESTAMP(6) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (response_id),
  KEY idx_identity_retention (retention_expires_at),
  CONSTRAINT fk_identity_response FOREIGN KEY (response_id) REFERENCES panjab_confidential.response_sessions(id),
  CONSTRAINT fk_identity_dek FOREIGN KEY (encrypted_data_key_id) REFERENCES panjab_confidential.encrypted_data_keys(id)
) ENGINE=InnoDB;

CREATE TABLE panjab_security.publication_approvals (
  id BINARY(16) NOT NULL,
  target_type VARCHAR(40) NOT NULL,
  target_version_id BINARY(16) NOT NULL,
  approval_stage VARCHAR(32) NOT NULL,
  decision VARCHAR(16) NOT NULL,
  decided_by BINARY(16) NOT NULL,
  reason VARCHAR(1000) NULL,
  decided_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_approval_stage_actor (target_type, target_version_id, approval_stage, decided_by),
  CONSTRAINT fk_approval_actor FOREIGN KEY (decided_by) REFERENCES panjab_security.admin_identities(id),
  CONSTRAINT chk_approval_decision CHECK (decision IN ('approved','rejected','revoked'))
) ENGINE=InnoDB;

CREATE TABLE panjab_security.audit_events (
  id BINARY(16) NOT NULL,
  occurred_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actor_id BINARY(16) NULL,
  actor_role_snapshot VARCHAR(255) NULL,
  action_code VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  target_type VARCHAR(60) NULL,
  target_id BINARY(16) NULL,
  outcome VARCHAR(20) NOT NULL,
  request_id BINARY(16) NOT NULL,
  network_digest BINARY(32) NULL,
  metadata_json JSON NULL,
  previous_event_hash BINARY(32) NULL,
  event_hash BINARY(32) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_audit_event_hash (event_hash),
  KEY idx_audit_time (occurred_at),
  KEY idx_audit_actor_time (actor_id, occurred_at),
  KEY idx_audit_action_time (action_code, occurred_at),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES panjab_security.admin_identities(id),
  CONSTRAINT chk_audit_outcome CHECK (outcome IN ('success','denied','failed'))
) ENGINE=InnoDB;

-- MySQL users and GRANT statements are intentionally omitted. They belong in a
-- reviewed deployment migration and must use REQUIRE SSL / verified client TLS.

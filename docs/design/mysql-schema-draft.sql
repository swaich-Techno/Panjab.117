-- Panjab 117 Step 2B synthetic proof-of-concept schema.
-- Validated only against disposable MySQL Community Server 8.4.13.
-- No credentials or real data. Production migration approval is still required.

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
  KEY idx_source_verification (verification_status, accessed_on),
  CONSTRAINT chk_source_verification CHECK (verification_status IN ('pending','verified','rejected','superseded'))
) ENGINE=InnoDB;

CREATE TABLE panjab_public.research_reports (
  id BINARY(16) NOT NULL,
  slug VARCHAR(120) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  lifecycle_status VARCHAR(24) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_report_slug (slug),
  CONSTRAINT chk_report_lifecycle CHECK (lifecycle_status IN ('draft','active','retired'))
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
  CONSTRAINT chk_report_locale CHECK (locale IN ('en','pa','hi')),
  CONSTRAINT chk_report_version_status CHECK (workflow_status IN ('draft','review','approved','published','superseded','withdrawn'))
) ENGINE=InnoDB;

CREATE TABLE panjab_public.report_citations (
  id BINARY(16) NOT NULL,
  source_id BINARY(16) NOT NULL,
  report_version_id BINARY(16) NOT NULL,
  locator VARCHAR(255) NULL,
  quotation_sha256 BINARY(32) NULL,
  verification_status VARCHAR(24) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_citation_source (source_id),
  KEY idx_citation_report (report_version_id),
  CONSTRAINT fk_report_citation_source FOREIGN KEY (source_id) REFERENCES panjab_public.research_sources(id),
  CONSTRAINT fk_report_citation_version FOREIGN KEY (report_version_id) REFERENCES panjab_public.research_report_versions(id),
  CONSTRAINT chk_report_citation_status CHECK (verification_status IN ('pending','verified','rejected'))
) ENGINE=InnoDB;

CREATE TABLE panjab_public.constituency_content_citations (
  id BINARY(16) NOT NULL,
  source_id BINARY(16) NOT NULL,
  constituency_content_version_id BINARY(16) NOT NULL,
  locator VARCHAR(255) NULL,
  quotation_sha256 BINARY(32) NULL,
  verification_status VARCHAR(24) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_constituency_citation_source (source_id),
  KEY idx_constituency_citation_version (constituency_content_version_id),
  CONSTRAINT fk_constituency_citation_source FOREIGN KEY (source_id) REFERENCES panjab_public.research_sources(id),
  CONSTRAINT fk_constituency_citation_version FOREIGN KEY (constituency_content_version_id) REFERENCES panjab_public.constituency_content_versions(id),
  CONSTRAINT chk_constituency_citation_status CHECK (verification_status IN ('pending','verified','rejected'))
) ENGINE=InnoDB;

CREATE TABLE panjab_public.source_verification_events (
  id BINARY(16) NOT NULL,
  source_id BINARY(16) NOT NULL,
  outcome VARCHAR(24) NOT NULL,
  notes VARCHAR(1000) NULL,
  verified_by BINARY(16) NOT NULL,
  verified_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_verification_source_time (source_id, verified_at),
  CONSTRAINT fk_verification_source FOREIGN KEY (source_id) REFERENCES panjab_public.research_sources(id),
  CONSTRAINT fk_verification_actor FOREIGN KEY (verified_by) REFERENCES panjab_security.admin_identities(id),
  CONSTRAINT chk_verification_outcome CHECK (outcome IN ('verified','rejected','needs_revision'))
) ENGINE=InnoDB;

CREATE TABLE panjab_public.report_corrections (
  id BINARY(16) NOT NULL,
  report_version_id BINARY(16) NOT NULL,
  superseding_report_version_id BINARY(16) NOT NULL,
  reason_code VARCHAR(40) NOT NULL,
  public_note TEXT NOT NULL,
  approved_by BINARY(16) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_report_correction_pair (report_version_id, superseding_report_version_id),
  CONSTRAINT fk_report_correction_original FOREIGN KEY (report_version_id) REFERENCES panjab_public.research_report_versions(id),
  CONSTRAINT fk_report_correction_replacement FOREIGN KEY (superseding_report_version_id) REFERENCES panjab_public.research_report_versions(id),
  CONSTRAINT fk_report_correction_approver FOREIGN KEY (approved_by) REFERENCES panjab_security.admin_identities(id),
  CONSTRAINT chk_report_correction_distinct CHECK (report_version_id <> superseding_report_version_id)
) ENGINE=InnoDB;

CREATE TABLE panjab_public.constituency_content_corrections (
  id BINARY(16) NOT NULL,
  constituency_content_version_id BINARY(16) NOT NULL,
  superseding_content_version_id BINARY(16) NOT NULL,
  reason_code VARCHAR(40) NOT NULL,
  public_note TEXT NOT NULL,
  approved_by BINARY(16) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_constituency_correction_pair (constituency_content_version_id, superseding_content_version_id),
  CONSTRAINT fk_constituency_correction_original FOREIGN KEY (constituency_content_version_id) REFERENCES panjab_public.constituency_content_versions(id),
  CONSTRAINT fk_constituency_correction_replacement FOREIGN KEY (superseding_content_version_id) REFERENCES panjab_public.constituency_content_versions(id),
  CONSTRAINT fk_constituency_correction_approver FOREIGN KEY (approved_by) REFERENCES panjab_security.admin_identities(id),
  CONSTRAINT chk_constituency_correction_distinct CHECK (constituency_content_version_id <> superseding_content_version_id)
) ENGINE=InnoDB;

CREATE TABLE panjab_public.survey_definitions (
  id BINARY(16) NOT NULL,
  survey_code VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  lifecycle_status VARCHAR(24) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_survey_code (survey_code),
  CONSTRAINT chk_survey_lifecycle CHECK (lifecycle_status IN ('draft','active','retired'))
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
  CONSTRAINT chk_survey_window CHECK (closes_at IS NULL OR opens_at IS NULL OR closes_at > opens_at),
  CONSTRAINT chk_survey_version_status CHECK (workflow_status IN ('draft','review','approved','open','closed','withdrawn'))
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
  UNIQUE KEY uq_question_id_version (id, survey_version_id),
  UNIQUE KEY uq_question_code (survey_version_id, question_code),
  UNIQUE KEY uq_question_order (survey_version_id, display_order),
  CONSTRAINT fk_question_survey_version FOREIGN KEY (survey_version_id) REFERENCES panjab_public.survey_versions(id),
  CONSTRAINT chk_question_type CHECK (question_type IN ('single_choice','multiple_choice','short_text','long_text','boolean')),
  CONSTRAINT chk_question_sensitivity CHECK (sensitivity_class IN ('public','internal','restricted','highly_restricted'))
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
  UNIQUE KEY uq_response_id_survey_version (id, survey_version_id),
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
  UNIQUE KEY uq_key_id_purpose (id, purpose),
  UNIQUE KEY uq_key_reference_digest (key_reference_digest),
  UNIQUE KEY uq_key_alias_version (key_alias, activated_at),
  CONSTRAINT chk_key_purpose CHECK (purpose IN ('answer','identity','backup','audit_anchor')),
  CONSTRAINT chk_key_status CHECK (lifecycle_status IN ('pending','active','decrypt_only','retired','compromised')),
  CONSTRAINT chk_key_retirement CHECK (retired_at IS NULL OR retired_at > activated_at)
) ENGINE=InnoDB;

CREATE TABLE panjab_confidential.answer_data_keys (
  id BINARY(16) NOT NULL,
  response_id BINARY(16) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  destroyed_at TIMESTAMP(6) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_answer_key_response (response_id),
  UNIQUE KEY uq_answer_key_id_response (id, response_id),
  CONSTRAINT fk_answer_key_response FOREIGN KEY (response_id) REFERENCES panjab_confidential.response_sessions(id),
  CONSTRAINT chk_answer_key_destruction CHECK (destroyed_at IS NULL OR destroyed_at >= created_at)
) ENGINE=InnoDB;

CREATE TABLE panjab_confidential.answer_data_key_wraps (
  id BINARY(16) NOT NULL,
  answer_data_key_id BINARY(16) NOT NULL,
  key_version_id BINARY(16) NOT NULL,
  key_purpose VARCHAR(40) GENERATED ALWAYS AS ('answer') STORED,
  wrapped_dek VARBINARY(1024) NOT NULL,
  wrapping_algorithm VARCHAR(40) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  wrap_status VARCHAR(20) NOT NULL,
  active_key_slot BINARY(16) GENERATED ALWAYS AS (IF(wrap_status = 'active', answer_data_key_id, NULL)) STORED,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  retired_at TIMESTAMP(6) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_answer_wrap_version (answer_data_key_id, key_version_id),
  UNIQUE KEY uq_answer_active_wrap (active_key_slot),
  KEY idx_answer_wrap_key_version (key_version_id),
  CONSTRAINT fk_answer_wrap_owner FOREIGN KEY (answer_data_key_id) REFERENCES panjab_confidential.answer_data_keys(id),
  CONSTRAINT fk_answer_wrap_key_version FOREIGN KEY (key_version_id, key_purpose) REFERENCES panjab_security.encryption_key_versions(id, purpose),
  CONSTRAINT chk_answer_wrap_status CHECK (wrap_status IN ('active','decrypt_only','retired')),
  CONSTRAINT chk_answer_wrap_retirement CHECK ((wrap_status = 'retired' AND retired_at IS NOT NULL) OR (wrap_status <> 'retired' AND retired_at IS NULL))
) ENGINE=InnoDB;

CREATE TABLE panjab_confidential.identity_data_keys (
  id BINARY(16) NOT NULL,
  response_id BINARY(16) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  destroyed_at TIMESTAMP(6) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_identity_key_response (response_id),
  UNIQUE KEY uq_identity_key_id_response (id, response_id),
  CONSTRAINT fk_identity_key_response FOREIGN KEY (response_id) REFERENCES panjab_confidential.response_sessions(id),
  CONSTRAINT chk_identity_key_destruction CHECK (destroyed_at IS NULL OR destroyed_at >= created_at)
) ENGINE=InnoDB;

CREATE TABLE panjab_confidential.identity_data_key_wraps (
  id BINARY(16) NOT NULL,
  identity_data_key_id BINARY(16) NOT NULL,
  key_version_id BINARY(16) NOT NULL,
  key_purpose VARCHAR(40) GENERATED ALWAYS AS ('identity') STORED,
  wrapped_dek VARBINARY(1024) NOT NULL,
  wrapping_algorithm VARCHAR(40) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  wrap_status VARCHAR(20) NOT NULL,
  active_key_slot BINARY(16) GENERATED ALWAYS AS (IF(wrap_status = 'active', identity_data_key_id, NULL)) STORED,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  retired_at TIMESTAMP(6) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_identity_wrap_version (identity_data_key_id, key_version_id),
  UNIQUE KEY uq_identity_active_wrap (active_key_slot),
  KEY idx_identity_wrap_key_version (key_version_id),
  CONSTRAINT fk_identity_wrap_owner FOREIGN KEY (identity_data_key_id) REFERENCES panjab_confidential.identity_data_keys(id),
  CONSTRAINT fk_identity_wrap_key_version FOREIGN KEY (key_version_id, key_purpose) REFERENCES panjab_security.encryption_key_versions(id, purpose),
  CONSTRAINT chk_identity_wrap_status CHECK (wrap_status IN ('active','decrypt_only','retired')),
  CONSTRAINT chk_identity_wrap_retirement CHECK ((wrap_status = 'retired' AND retired_at IS NOT NULL) OR (wrap_status <> 'retired' AND retired_at IS NULL))
) ENGINE=InnoDB;

CREATE TABLE panjab_confidential.encrypted_answers (
  id BINARY(16) NOT NULL,
  response_id BINARY(16) NOT NULL,
  survey_version_id BINARY(16) NOT NULL,
  question_id BINARY(16) NOT NULL,
  answer_data_key_id BINARY(16) NOT NULL,
  ciphertext MEDIUMBLOB NOT NULL,
  nonce BINARY(12) NOT NULL,
  auth_tag BINARY(16) NOT NULL,
  envelope_version SMALLINT UNSIGNED NOT NULL,
  aad_version SMALLINT UNSIGNED NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_answer_response_question (response_id, question_id),
  KEY idx_answer_question_version (question_id, survey_version_id),
  KEY idx_answer_key_owner (answer_data_key_id, response_id),
  CONSTRAINT fk_answer_response_version FOREIGN KEY (response_id, survey_version_id) REFERENCES panjab_confidential.response_sessions(id, survey_version_id),
  CONSTRAINT fk_answer_question_version FOREIGN KEY (question_id, survey_version_id) REFERENCES panjab_public.survey_questions(id, survey_version_id),
  CONSTRAINT fk_answer_key_owner FOREIGN KEY (answer_data_key_id, response_id) REFERENCES panjab_confidential.answer_data_keys(id, response_id),
  CONSTRAINT chk_answer_envelope_version CHECK (envelope_version = 1),
  CONSTRAINT chk_answer_aad_version CHECK (aad_version >= 1)
) ENGINE=InnoDB;

CREATE TABLE panjab_confidential.response_identities (
  response_id BINARY(16) NOT NULL,
  identity_data_key_id BINARY(16) NOT NULL,
  identity_ciphertext BLOB NOT NULL,
  nonce BINARY(12) NOT NULL,
  auth_tag BINARY(16) NOT NULL,
  envelope_version SMALLINT UNSIGNED NOT NULL,
  aad_version SMALLINT UNSIGNED NOT NULL,
  retention_expires_at TIMESTAMP(6) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (response_id),
  KEY idx_identity_key_owner (identity_data_key_id, response_id),
  KEY idx_identity_retention (retention_expires_at),
  CONSTRAINT fk_identity_response FOREIGN KEY (response_id) REFERENCES panjab_confidential.response_sessions(id),
  CONSTRAINT fk_identity_key_owner FOREIGN KEY (identity_data_key_id, response_id) REFERENCES panjab_confidential.identity_data_keys(id, response_id),
  CONSTRAINT chk_identity_envelope_version CHECK (envelope_version = 1),
  CONSTRAINT chk_identity_aad_version CHECK (aad_version >= 1)
) ENGINE=InnoDB;

CREATE TABLE panjab_security.report_publication_approvals (
  id BINARY(16) NOT NULL,
  report_version_id BINARY(16) NOT NULL,
  approval_stage VARCHAR(32) NOT NULL,
  decision VARCHAR(16) NOT NULL,
  decided_by BINARY(16) NOT NULL,
  reason VARCHAR(1000) NULL,
  decided_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_report_approval_stage_actor (report_version_id, approval_stage, decided_by),
  CONSTRAINT fk_report_approval_version FOREIGN KEY (report_version_id) REFERENCES panjab_public.research_report_versions(id),
  CONSTRAINT fk_report_approval_actor FOREIGN KEY (decided_by) REFERENCES panjab_security.admin_identities(id),
  CONSTRAINT chk_report_approval_decision CHECK (decision IN ('approved','rejected','revoked'))
) ENGINE=InnoDB;

CREATE TABLE panjab_security.constituency_publication_approvals (
  id BINARY(16) NOT NULL,
  constituency_content_version_id BINARY(16) NOT NULL,
  approval_stage VARCHAR(32) NOT NULL,
  decision VARCHAR(16) NOT NULL,
  decided_by BINARY(16) NOT NULL,
  reason VARCHAR(1000) NULL,
  decided_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_constituency_approval_stage_actor (constituency_content_version_id, approval_stage, decided_by),
  CONSTRAINT fk_constituency_approval_version FOREIGN KEY (constituency_content_version_id) REFERENCES panjab_public.constituency_content_versions(id),
  CONSTRAINT fk_constituency_approval_actor FOREIGN KEY (decided_by) REFERENCES panjab_security.admin_identities(id),
  CONSTRAINT chk_constituency_approval_decision CHECK (decision IN ('approved','rejected','revoked'))
) ENGINE=InnoDB;

CREATE TABLE panjab_security.survey_publication_approvals (
  id BINARY(16) NOT NULL,
  survey_version_id BINARY(16) NOT NULL,
  approval_stage VARCHAR(32) NOT NULL,
  decision VARCHAR(16) NOT NULL,
  decided_by BINARY(16) NOT NULL,
  reason VARCHAR(1000) NULL,
  decided_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_survey_approval_stage_actor (survey_version_id, approval_stage, decided_by),
  CONSTRAINT fk_survey_approval_version FOREIGN KEY (survey_version_id) REFERENCES panjab_public.survey_versions(id),
  CONSTRAINT fk_survey_approval_actor FOREIGN KEY (decided_by) REFERENCES panjab_security.admin_identities(id),
  CONSTRAINT chk_survey_approval_decision CHECK (decision IN ('approved','rejected','revoked'))
) ENGINE=InnoDB;

CREATE TABLE panjab_security.audit_events (
  id BINARY(16) NOT NULL,
  sequence_number BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
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
  UNIQUE KEY uq_audit_sequence (sequence_number),
  UNIQUE KEY uq_audit_event_hash (event_hash),
  KEY idx_audit_time (occurred_at),
  KEY idx_audit_actor_time (actor_id, occurred_at),
  KEY idx_audit_action_time (action_code, occurred_at),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES panjab_security.admin_identities(id),
  CONSTRAINT chk_audit_outcome CHECK (outcome IN ('success','denied','failed'))
) ENGINE=InnoDB;

CREATE TABLE panjab_security.audit_checkpoints (
  id BINARY(16) NOT NULL,
  from_sequence BIGINT UNSIGNED NOT NULL,
  to_sequence BIGINT UNSIGNED NOT NULL,
  event_count BIGINT UNSIGNED NOT NULL,
  terminal_event_hash BINARY(32) NOT NULL,
  anchor_key_reference_digest BINARY(32) NOT NULL,
  anchor_digest BINARY(32) NOT NULL,
  external_destination VARCHAR(255) NOT NULL,
  external_receipt_digest BINARY(32) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_audit_checkpoint_range (from_sequence, to_sequence),
  UNIQUE KEY uq_audit_checkpoint_anchor (anchor_digest),
  CONSTRAINT chk_audit_checkpoint_range CHECK (from_sequence >= 1 AND to_sequence >= from_sequence),
  CONSTRAINT chk_audit_checkpoint_count CHECK (event_count = (to_sequence - from_sequence + 1))
) ENGINE=InnoDB;

CREATE SQL SECURITY DEFINER VIEW panjab_public.published_constituency_content AS
SELECT id, constituency_id, locale, version_number, title, summary, body, published_at
FROM panjab_public.constituency_content_versions
WHERE workflow_status = 'published';

CREATE SQL SECURITY DEFINER VIEW panjab_public.published_research_reports AS
SELECT id, report_id, locale, version_number, title, abstract, body, published_at
FROM panjab_public.research_report_versions
WHERE workflow_status = 'published';

CREATE SQL SECURITY DEFINER VIEW panjab_public.open_survey_versions AS
SELECT id, survey_id, version_number, privacy_notice_version, opens_at, closes_at
FROM panjab_public.survey_versions
WHERE workflow_status = 'open'
  AND (opens_at IS NULL OR opens_at <= CURRENT_TIMESTAMP(6))
  AND (closes_at IS NULL OR closes_at > CURRENT_TIMESTAMP(6));

CREATE SQL SECURITY DEFINER VIEW panjab_confidential.survey_response_counts AS
SELECT rs.survey_version_id, ea.question_id, COUNT(*) AS response_count
FROM panjab_confidential.response_sessions rs
JOIN panjab_confidential.encrypted_answers ea ON ea.response_id = rs.id
WHERE rs.response_status = 'submitted'
GROUP BY rs.survey_version_id, ea.question_id
HAVING COUNT(*) >= 5;

DELIMITER $$

CREATE TRIGGER panjab_public.trg_constituency_version_immutable_update
BEFORE UPDATE ON panjab_public.constituency_content_versions
FOR EACH ROW
BEGIN
  IF OLD.workflow_status <> 'draft' AND NOT (
    OLD.constituency_id <=> NEW.constituency_id AND
    OLD.locale <=> NEW.locale AND
    OLD.version_number <=> NEW.version_number AND
    OLD.title <=> NEW.title AND
    OLD.summary <=> NEW.summary AND
    OLD.body <=> NEW.body AND
    OLD.authored_by <=> NEW.authored_by
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sealed constituency version content is immutable';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_constituency_version_immutable_delete
BEFORE DELETE ON panjab_public.constituency_content_versions
FOR EACH ROW
BEGIN
  IF OLD.workflow_status <> 'draft' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sealed constituency versions cannot be deleted';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_report_version_immutable_update
BEFORE UPDATE ON panjab_public.research_report_versions
FOR EACH ROW
BEGIN
  IF OLD.workflow_status <> 'draft' AND NOT (
    OLD.report_id <=> NEW.report_id AND
    OLD.locale <=> NEW.locale AND
    OLD.version_number <=> NEW.version_number AND
    OLD.title <=> NEW.title AND
    OLD.abstract <=> NEW.abstract AND
    OLD.body <=> NEW.body AND
    OLD.authored_by <=> NEW.authored_by
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sealed report version content is immutable';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_report_version_immutable_delete
BEFORE DELETE ON panjab_public.research_report_versions
FOR EACH ROW
BEGIN
  IF OLD.workflow_status <> 'draft' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sealed report versions cannot be deleted';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_survey_version_immutable_update
BEFORE UPDATE ON panjab_public.survey_versions
FOR EACH ROW
BEGIN
  IF OLD.workflow_status <> 'draft' AND NOT (
    OLD.survey_id <=> NEW.survey_id AND
    OLD.version_number <=> NEW.version_number AND
    OLD.privacy_notice_version <=> NEW.privacy_notice_version AND
    OLD.opens_at <=> NEW.opens_at AND
    OLD.closes_at <=> NEW.closes_at
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sealed survey version definition is immutable';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_survey_version_immutable_delete
BEFORE DELETE ON panjab_public.survey_versions
FOR EACH ROW
BEGIN
  IF OLD.workflow_status <> 'draft' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sealed survey versions cannot be deleted';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_question_insert_draft_only
BEFORE INSERT ON panjab_public.survey_questions
FOR EACH ROW
BEGIN
  IF (SELECT workflow_status FROM panjab_public.survey_versions WHERE id = NEW.survey_version_id) <> 'draft' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Questions can be added only to draft survey versions';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_question_update_draft_only
BEFORE UPDATE ON panjab_public.survey_questions
FOR EACH ROW
BEGIN
  IF (SELECT workflow_status FROM panjab_public.survey_versions WHERE id = OLD.survey_version_id) <> 'draft' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Questions in sealed survey versions are immutable';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_question_delete_draft_only
BEFORE DELETE ON panjab_public.survey_questions
FOR EACH ROW
BEGIN
  IF (SELECT workflow_status FROM panjab_public.survey_versions WHERE id = OLD.survey_version_id) <> 'draft' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Questions in sealed survey versions cannot be deleted';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_question_text_insert_draft_only
BEFORE INSERT ON panjab_public.survey_question_localizations
FOR EACH ROW
BEGIN
  IF (SELECT sv.workflow_status FROM panjab_public.survey_questions q JOIN panjab_public.survey_versions sv ON sv.id = q.survey_version_id WHERE q.id = NEW.question_id) <> 'draft' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Question text can be added only to draft surveys';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_question_text_update_draft_only
BEFORE UPDATE ON panjab_public.survey_question_localizations
FOR EACH ROW
BEGIN
  IF (SELECT sv.workflow_status FROM panjab_public.survey_questions q JOIN panjab_public.survey_versions sv ON sv.id = q.survey_version_id WHERE q.id = OLD.question_id) <> 'draft' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Question text in sealed surveys is immutable';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_question_text_delete_draft_only
BEFORE DELETE ON panjab_public.survey_question_localizations
FOR EACH ROW
BEGIN
  IF (SELECT sv.workflow_status FROM panjab_public.survey_questions q JOIN panjab_public.survey_versions sv ON sv.id = q.survey_version_id WHERE q.id = OLD.question_id) <> 'draft' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Question text in sealed surveys cannot be deleted';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_option_insert_draft_only
BEFORE INSERT ON panjab_public.survey_options
FOR EACH ROW
BEGIN
  IF (SELECT sv.workflow_status FROM panjab_public.survey_questions q JOIN panjab_public.survey_versions sv ON sv.id = q.survey_version_id WHERE q.id = NEW.question_id) <> 'draft' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Options can be added only to draft surveys';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_option_update_draft_only
BEFORE UPDATE ON panjab_public.survey_options
FOR EACH ROW
BEGIN
  IF (SELECT sv.workflow_status FROM panjab_public.survey_questions q JOIN panjab_public.survey_versions sv ON sv.id = q.survey_version_id WHERE q.id = OLD.question_id) <> 'draft' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Options in sealed surveys are immutable';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_option_delete_draft_only
BEFORE DELETE ON panjab_public.survey_options
FOR EACH ROW
BEGIN
  IF (SELECT sv.workflow_status FROM panjab_public.survey_questions q JOIN panjab_public.survey_versions sv ON sv.id = q.survey_version_id WHERE q.id = OLD.question_id) <> 'draft' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Options in sealed surveys cannot be deleted';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_option_text_insert_draft_only
BEFORE INSERT ON panjab_public.survey_option_localizations
FOR EACH ROW
BEGIN
  IF (SELECT sv.workflow_status FROM panjab_public.survey_options o JOIN panjab_public.survey_questions q ON q.id = o.question_id JOIN panjab_public.survey_versions sv ON sv.id = q.survey_version_id WHERE o.id = NEW.option_id) <> 'draft' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Option text can be added only to draft surveys';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_option_text_update_draft_only
BEFORE UPDATE ON panjab_public.survey_option_localizations
FOR EACH ROW
BEGIN
  IF (SELECT sv.workflow_status FROM panjab_public.survey_options o JOIN panjab_public.survey_questions q ON q.id = o.question_id JOIN panjab_public.survey_versions sv ON sv.id = q.survey_version_id WHERE o.id = OLD.option_id) <> 'draft' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Option text in sealed surveys is immutable';
  END IF;
END$$

CREATE TRIGGER panjab_public.trg_option_text_delete_draft_only
BEFORE DELETE ON panjab_public.survey_option_localizations
FOR EACH ROW
BEGIN
  IF (SELECT sv.workflow_status FROM panjab_public.survey_options o JOIN panjab_public.survey_questions q ON q.id = o.question_id JOIN panjab_public.survey_versions sv ON sv.id = q.survey_version_id WHERE o.id = OLD.option_id) <> 'draft' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Option text in sealed surveys cannot be deleted';
  END IF;
END$$

CREATE TRIGGER panjab_confidential.trg_answer_wrap_insert_live_key
BEFORE INSERT ON panjab_confidential.answer_data_key_wraps
FOR EACH ROW
BEGIN
  IF (SELECT destroyed_at FROM panjab_confidential.answer_data_keys WHERE id = NEW.answer_data_key_id) IS NOT NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Destroyed answer keys cannot receive new wraps';
  END IF;
END$$

CREATE TRIGGER panjab_confidential.trg_answer_wrap_safe_delete
BEFORE DELETE ON panjab_confidential.answer_data_key_wraps
FOR EACH ROW
BEGIN
  IF OLD.wrap_status <> 'retired' AND (SELECT destroyed_at FROM panjab_confidential.answer_data_keys WHERE id = OLD.answer_data_key_id) IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Active answer-key wraps require an approved destruction state';
  END IF;
END$$

CREATE TRIGGER panjab_confidential.trg_identity_wrap_insert_live_key
BEFORE INSERT ON panjab_confidential.identity_data_key_wraps
FOR EACH ROW
BEGIN
  IF (SELECT destroyed_at FROM panjab_confidential.identity_data_keys WHERE id = NEW.identity_data_key_id) IS NOT NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Destroyed identity keys cannot receive new wraps';
  END IF;
END$$

CREATE TRIGGER panjab_confidential.trg_identity_wrap_safe_delete
BEFORE DELETE ON panjab_confidential.identity_data_key_wraps
FOR EACH ROW
BEGIN
  IF OLD.wrap_status <> 'retired' AND (SELECT destroyed_at FROM panjab_confidential.identity_data_keys WHERE id = OLD.identity_data_key_id) IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Active identity-key wraps require an approved destruction state';
  END IF;
END$$

DELIMITER ;

-- Exact role grants are maintained separately in mysql-grants.sql so schema
-- validation never creates accounts or grants access implicitly.

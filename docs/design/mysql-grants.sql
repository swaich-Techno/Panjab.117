-- Panjab 117 Step 2B least-privilege MySQL 8.4 role design.
-- Execute only as an approved migration owner after schema creation.
-- This file creates roles, not login accounts, and contains no credentials.

CREATE ROLE IF NOT EXISTS
  'p117_public_reader',
  'p117_research_author',
  'p117_research_reviewer',
  'p117_survey_ingestion',
  'p117_survey_processor',
  'p117_survey_analyst',
  'p117_privacy_officer',
  'p117_security_officer',
  'p117_audit_writer',
  'p117_backup_operator',
  'p117_migration_owner';

GRANT SELECT ON panjab_public.published_constituency_content TO 'p117_public_reader';
GRANT SELECT ON panjab_public.published_research_reports TO 'p117_public_reader';
GRANT SELECT ON panjab_public.open_survey_versions TO 'p117_public_reader';

GRANT SELECT ON panjab_public.constituencies TO 'p117_research_author';
GRANT SELECT, INSERT, UPDATE ON panjab_public.constituency_content_versions TO 'p117_research_author';
GRANT SELECT, INSERT, UPDATE ON panjab_public.research_sources TO 'p117_research_author';
GRANT SELECT, INSERT, UPDATE ON panjab_public.research_reports TO 'p117_research_author';
GRANT SELECT, INSERT, UPDATE ON panjab_public.research_report_versions TO 'p117_research_author';
GRANT SELECT, INSERT ON panjab_public.report_citations TO 'p117_research_author';
GRANT SELECT, INSERT ON panjab_public.constituency_content_citations TO 'p117_research_author';

GRANT SELECT ON panjab_public.* TO 'p117_research_reviewer';
GRANT INSERT ON panjab_public.source_verification_events TO 'p117_research_reviewer';
GRANT INSERT ON panjab_security.report_publication_approvals TO 'p117_research_reviewer';
GRANT INSERT ON panjab_security.constituency_publication_approvals TO 'p117_research_reviewer';
GRANT INSERT ON panjab_security.survey_publication_approvals TO 'p117_research_reviewer';

GRANT SELECT ON panjab_public.open_survey_versions TO 'p117_survey_ingestion';
GRANT SELECT ON panjab_public.survey_questions TO 'p117_survey_ingestion';
GRANT SELECT ON panjab_public.survey_options TO 'p117_survey_ingestion';
GRANT INSERT ON panjab_confidential.response_sessions TO 'p117_survey_ingestion';
GRANT INSERT ON panjab_confidential.consent_records TO 'p117_survey_ingestion';
GRANT SELECT ON panjab_confidential.consent_purposes TO 'p117_survey_ingestion';
GRANT INSERT ON panjab_confidential.consent_record_purposes TO 'p117_survey_ingestion';
GRANT INSERT ON panjab_confidential.answer_data_keys TO 'p117_survey_ingestion';
GRANT INSERT ON panjab_confidential.answer_data_key_wraps TO 'p117_survey_ingestion';
GRANT INSERT ON panjab_confidential.encrypted_answers TO 'p117_survey_ingestion';
GRANT INSERT ON panjab_confidential.identity_data_keys TO 'p117_survey_ingestion';
GRANT INSERT ON panjab_confidential.identity_data_key_wraps TO 'p117_survey_ingestion';
GRANT INSERT ON panjab_confidential.response_identities TO 'p117_survey_ingestion';
GRANT INSERT ON panjab_security.audit_events TO 'p117_survey_ingestion';

GRANT SELECT ON panjab_confidential.response_sessions TO 'p117_survey_processor';
GRANT SELECT ON panjab_confidential.encrypted_answers TO 'p117_survey_processor';
GRANT SELECT ON panjab_confidential.answer_data_keys TO 'p117_survey_processor';
GRANT SELECT ON panjab_confidential.answer_data_key_wraps TO 'p117_survey_processor';
GRANT SELECT ON panjab_security.encryption_key_versions TO 'p117_survey_processor';

GRANT SELECT ON panjab_confidential.survey_response_counts TO 'p117_survey_analyst';

GRANT SELECT ON panjab_confidential.response_sessions TO 'p117_privacy_officer';
GRANT SELECT, DELETE ON panjab_confidential.response_identities TO 'p117_privacy_officer';
GRANT SELECT ON panjab_confidential.identity_data_keys TO 'p117_privacy_officer';
GRANT UPDATE (destroyed_at) ON panjab_confidential.identity_data_keys TO 'p117_privacy_officer';
GRANT SELECT, DELETE ON panjab_confidential.identity_data_key_wraps TO 'p117_privacy_officer';
GRANT SELECT ON panjab_confidential.answer_data_keys TO 'p117_privacy_officer';
GRANT UPDATE (destroyed_at) ON panjab_confidential.answer_data_keys TO 'p117_privacy_officer';
GRANT SELECT, DELETE ON panjab_confidential.answer_data_key_wraps TO 'p117_privacy_officer';
GRANT INSERT ON panjab_security.audit_events TO 'p117_privacy_officer';

GRANT SELECT ON panjab_security.admin_identities TO 'p117_security_officer';
GRANT SELECT ON panjab_security.admin_role_assignments TO 'p117_security_officer';
GRANT SELECT ON panjab_security.audit_events TO 'p117_security_officer';
GRANT SELECT ON panjab_security.audit_checkpoints TO 'p117_security_officer';

GRANT INSERT ON panjab_security.audit_events TO 'p117_audit_writer';
GRANT INSERT ON panjab_security.audit_checkpoints TO 'p117_audit_writer';

GRANT SELECT, SHOW VIEW, TRIGGER ON panjab_public.* TO 'p117_backup_operator';
GRANT SELECT, SHOW VIEW, TRIGGER ON panjab_confidential.* TO 'p117_backup_operator';
GRANT SELECT, SHOW VIEW, TRIGGER ON panjab_security.* TO 'p117_backup_operator';

GRANT CREATE, ALTER, DROP, INDEX, CREATE VIEW, SHOW VIEW, TRIGGER, REFERENCES,
  SELECT, INSERT, UPDATE, DELETE ON panjab_public.* TO 'p117_migration_owner';
GRANT CREATE, ALTER, DROP, INDEX, CREATE VIEW, SHOW VIEW, TRIGGER, REFERENCES,
  SELECT, INSERT, UPDATE, DELETE ON panjab_confidential.* TO 'p117_migration_owner';
GRANT CREATE, ALTER, DROP, INDEX, CREATE VIEW, SHOW VIEW, TRIGGER, REFERENCES,
  SELECT, INSERT, UPDATE, DELETE ON panjab_security.* TO 'p117_migration_owner';

-- Production login accounts are created separately with environment-specific
-- host restrictions and REQUIRE SSL, then assigned exactly one workload role.
-- No role receives GRANT OPTION, FILE, PROCESS, SUPER, or global *.* access.

-- Panjab 117 Step 5A role design. DO NOT apply until database and operators are approved.
-- User accounts, host restrictions and credentials must be provisioned separately.

CREATE ROLE IF NOT EXISTS
  'p117_survey_ingest',
  'p117_civic_reviewer',
  'p117_political_reviewer',
  'p117_privacy_officer',
  'p117_security_auditor',
  'p117_backup_operator';

GRANT SELECT ON panjab117.survey_questionnaire_versions TO 'p117_survey_ingest';
GRANT SELECT ON panjab117.survey_consent_notice_versions TO 'p117_survey_ingest';
GRANT SELECT, INSERT ON panjab117.survey_responses TO 'p117_survey_ingest';
GRANT INSERT ON panjab117.survey_civic_payloads TO 'p117_survey_ingest';
GRANT INSERT ON panjab117.survey_political_payloads TO 'p117_survey_ingest';
GRANT SELECT, INSERT, UPDATE ON panjab117.survey_screening_claims TO 'p117_survey_ingest';
GRANT INSERT ON panjab117.survey_withdrawal_receipts TO 'p117_survey_ingest';

GRANT SELECT ON panjab117.survey_responses TO 'p117_civic_reviewer';
GRANT SELECT ON panjab117.survey_civic_payloads TO 'p117_civic_reviewer';

GRANT SELECT ON panjab117.survey_responses TO 'p117_political_reviewer';
GRANT SELECT ON panjab117.survey_political_payloads TO 'p117_political_reviewer';

GRANT SELECT, UPDATE (withdrawal_state) ON panjab117.survey_responses TO 'p117_privacy_officer';
GRANT DELETE ON panjab117.survey_civic_payloads TO 'p117_privacy_officer';
GRANT DELETE ON panjab117.survey_political_payloads TO 'p117_privacy_officer';
GRANT SELECT, UPDATE (attempts, status) ON panjab117.survey_withdrawal_receipts TO 'p117_privacy_officer';
GRANT SELECT, INSERT, UPDATE ON panjab117.survey_deletion_ledger TO 'p117_privacy_officer';

GRANT SELECT ON panjab117.survey_access_audit TO 'p117_security_auditor';

-- The backup role receives only the permissions required by the selected backup tool.
-- Do not grant SELECT on political payloads to application or analyst identities by default.
-- Do not grant any survey role to the public Pages application.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const schema = readFileSync(
  resolve("database/migrations/mysql/0001_step_5a_secure_intake.sql"),
  "utf8",
);
const grants = readFileSync(
  resolve("database/migrations/mysql/0002_step_5a_least_privilege_roles.sql"),
  "utf8",
);
const hardening = readFileSync(
  resolve("database/migrations/mysql/0003_step_5b_verification_hardening.sql"),
  "utf8",
);

describe("Step 5A and Step 5B MySQL migration contract", () => {
  it("separates civic and political ciphertext and constrains all nine segments", () => {
    expect(schema).toContain("CREATE TABLE survey_civic_payloads");
    expect(schema).toContain("CREATE TABLE survey_political_payloads");
    expect(schema).toContain(
      "assembly_segment_number IN (54, 55, 56, 57, 58, 59, 67, 69, 106)",
    );
    expect(schema).toContain("UNIQUE KEY uq_screening_claim");
  });

  it("does not add direct identifiers or raw network identifiers", () => {
    const normalized = schema.toLowerCase();
    for (const prohibited of [
      "participant_name",
      "phone_number",
      "email_address",
      "raw_ip",
      "gps_coordinate",
      "browser_fingerprint",
    ]) {
      expect(normalized).not.toContain(prohibited);
    }
  });

  it("keeps ingestion and civic review away from political reads", () => {
    expect(grants).toContain(
      "GRANT SELECT ON panjab117.survey_political_payloads TO 'p117_political_reviewer'",
    );
    expect(grants).not.toContain(
      "panjab117.survey_political_payloads TO 'p117_civic_reviewer'",
    );
    expect(grants).not.toContain(
      "GRANT SELECT ON panjab117.survey_political_payloads TO 'p117_survey_ingest'",
    );
  });

  it("binds collection to genuine approval and political storage to consent", () => {
    expect(hardening).toContain("CREATE TABLE survey_collection_approvals");
    expect(hardening).toContain("fk_response_collection_approval");
    expect(hardening).toContain("fk_political_response_consent");
    expect(hardening).toContain("CHECK (political_consent = TRUE)");
    expect(hardening).toContain(
      "MODIFY COLUMN collection_approval_id BINARY(16) NOT NULL",
    );
  });

  it("narrows ingestion and privacy update privileges to named columns", () => {
    expect(hardening).toContain(
      "GRANT UPDATE (claim_count, last_seen_at, response_id)",
    );
    expect(hardening).toContain(
      "GRANT SELECT (response_id, withdrawal_state), UPDATE (withdrawal_state)",
    );
    expect(hardening).toContain("UPDATE (attempts, status)");
  });
});

import { describe, expect, it } from "vitest";

import {
  assertAuthorized,
  isAuthorized,
  operations,
  roles,
  type Operation,
  type Role,
} from "./authorization";

const expectedOperations: Readonly<Record<Role, readonly Operation[]>> = {
  public_reader: ["read_public_content"],
  research_author: ["read_public_content", "create_research_draft"],
  research_reviewer: ["read_public_content", "review_research"],
  survey_ingestion: ["ingest_survey_response"],
  survey_analyst: ["read_deidentified_survey"],
  privacy_officer: ["process_privacy_request"],
  security_officer: ["read_security_audit"],
  backup_operator: ["create_backup"],
  raw_civic_reviewer: ["read_raw_civic_response"],
  raw_political_reviewer: ["read_raw_political_response"],
  survey_export_authorizer: ["authorize_survey_export"],
  survey_export_operator: ["export_approved_survey"],
};

describe("server-side RBAC proof of concept", () => {
  it.each(roles)("allows only the documented operations for %s", (role) => {
    for (const operation of operations) {
      expect(isAuthorized(role, operation)).toBe(
        expectedOperations[role].includes(operation),
      );
    }
  });

  it.each(
    roles.flatMap((role) =>
      operations
        .filter((operation) => !expectedOperations[role].includes(operation))
        .map((operation) => [role, operation] as const),
    ),
  )("denies %s from %s", (role, operation) => {
    expect(() => assertAuthorized(role, operation)).toThrow("Access denied");
  });

  it("prevents the ingestion role from reading or backing up responses", () => {
    expect(() =>
      assertAuthorized("survey_ingestion", "read_deidentified_survey"),
    ).toThrow("Access denied");
    expect(() => assertAuthorized("survey_ingestion", "create_backup")).toThrow(
      "Access denied",
    );
  });

  it("prevents the backup operator from analysis and privacy actions", () => {
    expect(() =>
      assertAuthorized("backup_operator", "read_deidentified_survey"),
    ).toThrow("Access denied");
    expect(() =>
      assertAuthorized("backup_operator", "process_privacy_request"),
    ).toThrow("Access denied");
  });

  it("keeps civic, political, authorization and export duties separated", () => {
    expect(() =>
      assertAuthorized("raw_civic_reviewer", "read_raw_political_response"),
    ).toThrow("Access denied");
    expect(() =>
      assertAuthorized("survey_export_operator", "authorize_survey_export"),
    ).toThrow("Access denied");
    expect(() =>
      assertAuthorized("survey_export_authorizer", "export_approved_survey"),
    ).toThrow("Access denied");
  });
});

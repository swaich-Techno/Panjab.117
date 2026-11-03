export const roles = [
  "public_reader",
  "research_author",
  "research_reviewer",
  "survey_ingestion",
  "survey_analyst",
  "privacy_officer",
  "security_officer",
  "backup_operator",
] as const;

export type Role = (typeof roles)[number];

export const operations = [
  "read_public_content",
  "create_research_draft",
  "review_research",
  "ingest_survey_response",
  "read_deidentified_survey",
  "process_privacy_request",
  "read_security_audit",
  "create_backup",
] as const;

export type Operation = (typeof operations)[number];

const grants: Readonly<Record<Role, ReadonlySet<Operation>>> = {
  public_reader: new Set(["read_public_content"]),
  research_author: new Set(["read_public_content", "create_research_draft"]),
  research_reviewer: new Set(["read_public_content", "review_research"]),
  survey_ingestion: new Set(["ingest_survey_response"]),
  survey_analyst: new Set(["read_deidentified_survey"]),
  privacy_officer: new Set(["process_privacy_request"]),
  security_officer: new Set(["read_security_audit"]),
  backup_operator: new Set(["create_backup"]),
};

export class AccessDeniedError extends Error {
  constructor() {
    super("Access denied");
    this.name = "AccessDeniedError";
  }
}

export function isAuthorized(role: Role, operation: Operation): boolean {
  return grants[role].has(operation);
}

export function assertAuthorized(role: Role, operation: Operation): void {
  if (!isAuthorized(role, operation)) {
    throw new AccessDeniedError();
  }
}

export const candidateStatuses = [
  "no_confirmed_announcement",
  "reported_or_rumored",
  "party_announced",
  "nomination_filed",
  "nomination_accepted",
  "nomination_rejected",
  "withdrawn",
  "officially_contesting",
  "superseded_or_corrected",
] as const;

export type CandidateStatus = (typeof candidateStatuses)[number];
export type CandidateSourceType =
  | "eci_official"
  | "party_official"
  | "authorized_official_statement"
  | "reliable_reporting";

export type CandidateSourceRecord = {
  constituencyNumber: number;
  candidateName: string;
  partyName: string;
  status: CandidateStatus;
  sourceUrl: string;
  sourceType: CandidateSourceType;
  announcementDate: string;
  retrievedAt: string;
  lastCheckedAt: string;
  evidenceExcerpt: string;
  reviewerDecision: "pending" | "accepted" | "rejected";
  publicationStatus: "draft" | "approved" | "published" | "retracted";
};

export const candidateIntelligenceConfiguration = {
  externalAiEnabled: false,
  automaticPublicationEnabled: false,
  confidentialSurveyDataPermitted: false,
  monitoringMode: "deterministic_manual_review_queue",
} as const;

export function validateCandidateSourceRecord(
  record: CandidateSourceRecord,
): void {
  if (
    !Number.isSafeInteger(record.constituencyNumber) ||
    record.constituencyNumber < 1 ||
    record.constituencyNumber > 117
  ) {
    throw new Error("Candidate record has an invalid constituency");
  }
  const source = new URL(record.sourceUrl);
  if (source.protocol !== "https:") {
    throw new Error("Candidate evidence must use HTTPS");
  }
  if (!record.candidateName.trim() || !record.evidenceExcerpt.trim()) {
    throw new Error("Candidate evidence cannot be empty");
  }
  if (
    record.status === "officially_contesting" &&
    record.sourceType !== "eci_official"
  ) {
    throw new Error("Officially contesting status requires an ECI source");
  }
  if (
    record.publicationStatus === "published" &&
    record.reviewerDecision !== "accepted"
  ) {
    throw new Error("Publication requires a named human review decision");
  }
}

export function approveCandidateRecord(
  record: CandidateSourceRecord,
  decision: "accepted" | "rejected",
): CandidateSourceRecord {
  validateCandidateSourceRecord(record);
  return {
    ...record,
    reviewerDecision: decision,
    publicationStatus: decision === "accepted" ? "approved" : "retracted",
  };
}

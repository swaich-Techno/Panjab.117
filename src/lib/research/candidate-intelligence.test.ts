import { describe, expect, it } from "vitest";

import {
  approveCandidateRecord,
  candidateIntelligenceConfiguration,
  validateCandidateSourceRecord,
  type CandidateSourceRecord,
} from "./candidate-intelligence";
import {
  getPublishedCandidateRecords,
  verifiedCandidateSourceRegistry,
} from "./candidate-source-registry";

const draft: CandidateSourceRecord = {
  constituencyNumber: 58,
  candidateName: "Synthetic Candidate",
  partyName: "Synthetic Party",
  status: "party_announced",
  sourceUrl: "https://example.invalid/official-release",
  sourceType: "party_official",
  announcementDate: "2026-11-10",
  retrievedAt: "2026-11-10T10:00:00+05:30",
  lastCheckedAt: "2026-11-10T10:00:00+05:30",
  evidenceExcerpt: "Synthetic evidence used only for validation tests.",
  reviewerDecision: "pending",
  publicationStatus: "draft",
};

describe("candidate intelligence safeguards", () => {
  it("keeps external AI and automatic publication disabled", () => {
    expect(candidateIntelligenceConfiguration).toMatchObject({
      externalAiEnabled: false,
      automaticPublicationEnabled: false,
      confidentialSurveyDataPermitted: false,
    });
  });

  it("requires ECI evidence for officially contesting status", () => {
    expect(() =>
      validateCandidateSourceRecord({
        ...draft,
        status: "officially_contesting",
      }),
    ).toThrow("requires an ECI source");
  });

  it("cannot publish without accepted human review", () => {
    expect(() =>
      validateCandidateSourceRecord({
        ...draft,
        publicationStatus: "published",
      }),
    ).toThrow("requires a named human review");
  });

  it("moves accepted evidence only to approved, not published", () => {
    expect(approveCandidateRecord(draft, "accepted")).toMatchObject({
      reviewerDecision: "accepted",
      publicationStatus: "approved",
    });
  });

  it("starts with an empty verified registry rather than invented candidates", () => {
    expect(verifiedCandidateSourceRegistry).toEqual([]);
    expect(getPublishedCandidateRecords(58)).toEqual([]);
  });
});

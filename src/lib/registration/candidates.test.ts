import { describe, expect, it } from "vitest";

import {
  applyCandidateUpdate,
  candidateDirectory,
  findCandidateRecord,
} from "./candidates";

describe("versioned candidate directory", () => {
  it("contains only the six supplied source-backed records", () => {
    expect(
      candidateDirectory.map((record) => [
        record.assemblyConstituencyId,
        record.partyOrOrganisationId,
        record.candidateFullName,
      ]),
    ).toEqual([
      [54, "ad_wpd", "Satwant Singh"],
      [55, "aap", "Lakhbir Singh Rai"],
      [56, "aap", "Gurinder Singh Garry Waring"],
      [58, "aap", "Jagtar Singh Diyalpura"],
      [67, "aap", "Manwinder Singh Giaspura"],
      [106, "aap", "Jaswant Singh Gajjan Majra"],
    ]);
    expect(
      candidateDirectory.every(
        (record) =>
          record.sourceUrl.startsWith("https://") &&
          record.lastVerificationDate === "2026-11-05" &&
          record.statusHistory.length > 0,
      ),
    ).toBe(true);
  });

  it("does not present the WPD record as an ECI-confirmed party announcement", () => {
    expect(findCandidateRecord(54, "ad_wpd")).toMatchObject({
      announcementStatus: "reported_or_proposed_not_confirmed",
    });
  });

  it("uses the unannounced fallback for combinations without evidence", () => {
    expect(findCandidateRecord(54, "aap")).toBeNull();
    expect(findCandidateRecord(55, "inc")).toBeNull();
  });

  it("appends evidence-backed status updates without mutating history", () => {
    const current = candidateDirectory[1]!;
    const updated = applyCandidateUpdate(current, {
      status: "withdrawn_or_replaced",
      effectiveDate: "2026-11-06",
      verificationDate: "2026-11-06",
      sourceUrl: "https://example.org/source-update",
      note: "Synthetic test of an evidence-backed replacement workflow.",
    });
    expect(current.statusHistory).toHaveLength(1);
    expect(updated.statusHistory).toHaveLength(2);
    expect(updated.announcementStatus).toBe("withdrawn_or_replaced");
  });
});

import { describe, expect, it } from "vitest";

import {
  createVoluntarySurveyReport,
  summarizeCategories,
  type SyntheticSurveyResponse,
} from "./statistics";

describe("deterministic survey statistics and disclosure control", () => {
  it("handles a zero denominator without NaN or Infinity", () => {
    expect(
      summarizeCategories([null, undefined, ""], { smallCellThreshold: 2 }),
    ).toEqual({
      denominator: 0,
      missing: 3,
      totalsSuppressed: false,
      categories: [],
    });
  });

  it("separates missing values from the valid denominator", () => {
    const result = summarizeCategories(["A", "A", "B", "B", null, " "], {
      smallCellThreshold: 2,
    });
    expect(result.denominator).toBe(4);
    expect(result.missing).toBe(2);
    expect(result.categories).toEqual([
      {
        value: "A",
        count: 2,
        percentage: 50,
        suppressed: false,
        suppressionReason: null,
      },
      {
        value: "B",
        count: 2,
        percentage: 50,
        suppressed: false,
        suppressionReason: null,
      },
    ]);
  });

  it("uses complementary suppression when one small cell could be reconstructed", () => {
    const result = summarizeCategories(
      ["A", "A", "A", "A", "B", "B", "B", "C"],
      { smallCellThreshold: 2 },
    );

    expect(result.categories).toEqual([
      {
        value: "A",
        count: 4,
        percentage: 50,
        suppressed: false,
        suppressionReason: null,
      },
      {
        value: "B",
        count: null,
        percentage: null,
        suppressed: true,
        suppressionReason: "complementary",
      },
      {
        value: "C",
        count: null,
        percentage: null,
        suppressed: true,
        suppressionReason: "small_cell",
      },
    ]);
  });

  it("reports all nine segments and excludes duplicate-review records", () => {
    const responses: SyntheticSurveyResponse[] = [
      {
        id: "synthetic-1",
        assemblySegmentNumber: 54,
        answers: { healthcare_access: "good" },
        duplicateReviewStatus: "included",
      },
      {
        id: "synthetic-2",
        assemblySegmentNumber: 54,
        answers: { healthcare_access: null },
        duplicateReviewStatus: "included",
      },
      {
        id: "synthetic-3",
        assemblySegmentNumber: 54,
        answers: { healthcare_access: "poor" },
        duplicateReviewStatus: "pending_review",
      },
      {
        id: "synthetic-4",
        assemblySegmentNumber: 54,
        answers: { healthcare_access: "poor" },
        duplicateReviewStatus: "confirmed_duplicate",
      },
    ];

    const report = createVoluntarySurveyReport(responses, "healthcare_access", {
      smallCellThreshold: 2,
    });
    const segment54 = report.segments[0]!;

    expect(
      report.segments.map(({ assemblySegmentNumber }) => assemblySegmentNumber),
    ).toEqual([54, 55, 56, 57, 58, 59, 67, 69, 106]);
    expect(segment54).toMatchObject({
      received: 4,
      included: 2,
      pendingDuplicateReview: null,
      confirmedDuplicatesExcluded: null,
      totalsSuppressed: true,
    });
    expect(segment54.answerSummary).toMatchObject({
      denominator: null,
      missing: null,
      totalsSuppressed: true,
    });
  });

  it("labels outputs as voluntary and forbids election prediction use", () => {
    const report = createVoluntarySurveyReport([], "community_priority", {
      smallCellThreshold: 5,
    });

    expect(report.inferenceBasis).toBe(
      "voluntary_responses_not_representative_polling",
    );
    expect(report.electionPredictionPermitted).toBe(false);
  });

  it("rejects unsafe suppression thresholds", () => {
    expect(() => summarizeCategories(["A"], { smallCellThreshold: 1 })).toThrow(
      "at least 2",
    );
  });
});

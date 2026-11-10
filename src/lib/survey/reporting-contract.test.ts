import { describe, expect, it } from "vitest";

import {
  mergeAggregateBatches,
  PUBLIC_POLITICAL_MINIMUM_SAMPLE,
  roundWorkbookTabs,
  toPublicAggregate,
  type ApprovedAggregateRow,
} from "./reporting-contract";

const row: ApprovedAggregateRow = {
  surveyRoundId: "PRE1",
  assemblyConstituencyNumber: 58,
  metricId: "party_preference",
  optionId: "prefer_not_to_say",
  approvedCount: 12,
  eligibleSampleCount: 49,
  reportingDateIst: "2026-11-16",
  questionnaireVersion: "synthetic-test-v1",
  sourceBatchId: "batch-001",
  lastVerifiedAt: "2026-11-16T12:00:00+05:30",
  politicalOpinion: true,
};

describe("reporting contract", () => {
  it("omits the confidential response tab from the default workbook", () => {
    expect(roundWorkbookTabs).not.toContain("Responses_Private");
  });

  it("suppresses small political cells", () => {
    expect(toPublicAggregate(row)).toMatchObject({
      approvedCount: null,
      suppressed: true,
      suppressionReason: "small_political_sample",
    });
  });

  it("keeps adequately sized approved aggregates", () => {
    expect(
      toPublicAggregate({
        ...row,
        approvedCount: PUBLIC_POLITICAL_MINIMUM_SAMPLE,
        eligibleSampleCount: 100,
      }),
    ).toMatchObject({ approvedCount: 50, suppressed: false });
  });

  it("is idempotent for retried source batches and wave-separated", () => {
    const secondWave = { ...row, surveyRoundId: "PRE2" as const };
    const result = mergeAggregateBatches([row], [row, secondWave]);
    expect(result).toHaveLength(2);
    expect(result.map(({ surveyRoundId }) => surveyRoundId)).toEqual([
      "PRE1",
      "PRE2",
    ]);
  });

  it("rejects invalid aggregate counts and constituencies", () => {
    expect(() => toPublicAggregate({ ...row, approvedCount: 50 })).toThrow();
    expect(() =>
      toPublicAggregate({ ...row, assemblyConstituencyNumber: 118 }),
    ).toThrow();
  });
});

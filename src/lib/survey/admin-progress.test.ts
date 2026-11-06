import { describe, expect, it } from "vitest";

import {
  AdminProgressAuthorizationError,
  buildAdminProgressDashboard,
} from "./admin-progress";
import {
  eligibleAssemblySegmentNumbers,
  type SubmissionCounts,
} from "./collection-targets";

const emptyCounts: SubmissionCounts = {
  rawReceipts: 0,
  accepted: 0,
  validRetainedEligible: 0,
  pendingReview: 0,
  duplicate: 0,
  invalid: 0,
  withdrawn: 0,
  excluded: 0,
  latestSuccessfulProcessingAt: null,
  processingFailures: 0,
};

describe("administrator-only progress projection", () => {
  it("fails closed without the dedicated permission", () => {
    expect(() =>
      buildAdminProgressDashboard({
        principal: {
          authenticated: true,
          subject: "operator@example",
          permissions: [],
        },
        generatedAt: "2026-11-06T10:00:00.000Z",
        syntheticOnly: true,
        countsBySegment: new Map(),
      }),
    ).toThrow(AdminProgressAuthorizationError);
  });

  it("builds all nine synthetic progress rows for an authorized principal", () => {
    const counts = new Map(
      eligibleAssemblySegmentNumbers.map((number) => [number, emptyCounts]),
    );
    const result = buildAdminProgressDashboard({
      principal: {
        authenticated: true,
        subject: "operator@example",
        permissions: ["survey:progress:read"],
      },
      generatedAt: "2026-11-06T10:00:00.000Z",
      syntheticOnly: true,
      countsBySegment: counts,
    });
    expect(result.constituencies).toHaveLength(9);
    expect(result.syntheticOnly).toBe(true);
    expect(result.alerts).toEqual([]);
  });

  it("refuses to represent real data in this development-only model", () => {
    expect(() =>
      buildAdminProgressDashboard({
        principal: {
          authenticated: true,
          subject: "operator@example",
          permissions: ["survey:progress:read"],
        },
        generatedAt: "2026-11-06T10:00:00.000Z",
        syntheticOnly: false,
        countsBySegment: new Map(),
      }),
    ).toThrow(/synthetic evidence/u);
  });
});

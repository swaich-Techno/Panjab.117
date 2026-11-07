import { describe, expect, it } from "vitest";

import {
  AdminProgressAuthorizationError,
  buildAdminProgressDashboard,
} from "./admin-progress";
import {
  eligibleAssemblySegmentNumbers,
  STATEWIDE_NUMBER_OF_CONSTITUENCIES,
  type SubmissionCounts,
} from "./collection-targets";
import { collectionPhases } from "./collection-phases";

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
    expect(result.phaseId).toBe("fatehgarh_sahib");
    expect(result.syntheticOnly).toBe(true);
    expect(result.alerts).toEqual([]);
  });

  it("builds all 117 statewide rows without treating the target as a cap", () => {
    const counts = new Map(
      collectionPhases.punjab_statewide.assemblySegmentNumbers.map((number) => [
        number,
        emptyCounts,
      ]),
    );
    const result = buildAdminProgressDashboard({
      principal: {
        authenticated: true,
        subject: "operator@example",
        permissions: ["survey:progress:read"],
      },
      generatedAt: "2026-11-07T10:00:00.000Z",
      syntheticOnly: true,
      phaseId: "punjab_statewide",
      countsBySegment: counts,
    });
    expect(result.phaseId).toBe("punjab_statewide");
    expect(result.constituencies).toHaveLength(
      STATEWIDE_NUMBER_OF_CONSTITUENCIES,
    );
    expect(result.constituencies.at(0)?.assemblySegmentNumber).toBe(1);
    expect(result.constituencies.at(-1)?.assemblySegmentNumber).toBe(117);
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

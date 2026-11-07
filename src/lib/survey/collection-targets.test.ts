import { describe, expect, it } from "vitest";

import {
  calculateConstituencyProgress,
  eligibleAssemblySegmentNumbers,
  MAX_SUBMISSIONS_PER_CONSTITUENCY,
  NUMBER_OF_CONSTITUENCIES,
  recordSyntheticValidSubmission,
  STATEWIDE_NUMBER_OF_CONSTITUENCIES,
  STATEWIDE_TOTAL_MINIMUM_TARGET,
  targetAllowsAnotherEligibleSubmission,
  TARGET_VALID_SUBMISSIONS_PER_CONSTITUENCY,
  TOTAL_MINIMUM_TARGET,
  type SubmissionCounts,
} from "./collection-targets";

describe("nine-constituency collection targets", () => {
  it("defines the reviewed scope and configurable minimum", () => {
    expect(eligibleAssemblySegmentNumbers).toEqual([
      54, 55, 56, 57, 58, 59, 67, 69, 106,
    ]);
    expect(NUMBER_OF_CONSTITUENCIES).toBe(9);
    expect(TARGET_VALID_SUBMISSIONS_PER_CONSTITUENCY).toBe(500);
    expect(TOTAL_MINIMUM_TARGET).toBe(4_500);
    expect(STATEWIDE_NUMBER_OF_CONSTITUENCIES).toBe(117);
    expect(STATEWIDE_TOTAL_MINIMUM_TARGET).toBe(58_500);
    expect(MAX_SUBMISSIONS_PER_CONSTITUENCY).toBeNull();
  });

  it.each([
    { validCount: 499, remaining: 1, targetReached: false },
    { validCount: 500, remaining: 0, targetReached: true },
    { validCount: 501, remaining: 0, targetReached: true },
    { validCount: 750, remaining: 0, targetReached: true },
  ])(
    "handles $validCount legitimate synthetic submissions without a target rejection",
    ({ validCount, remaining, targetReached }) => {
      let counts: SubmissionCounts = {
        rawReceipts: 0,
        accepted: 0,
        validRetainedEligible: 0,
        pendingReview: 0,
        duplicate: 0,
        invalid: 0,
        withdrawn: 0,
        excluded: 0,
        latestSuccessfulProcessingAt: "2026-11-06T10:00:00.000Z",
        processingFailures: 0,
      };
      for (let index = 0; index < validCount; index += 1) {
        counts = recordSyntheticValidSubmission(counts, 54);
      }
      expect(targetAllowsAnotherEligibleSubmission(54, validCount)).toBe(true);
      const progress = calculateConstituencyProgress(54, counts);
      expect(progress.validRetainedEligible).toBe(validCount);
      expect(progress.remaining).toBe(remaining);
      expect(progress.targetReached).toBe(targetReached);
      expect(progress.targetAchievementPercentage).toBe(
        (validCount / 500) * 100,
      );
    },
  );

  it("counts only retained, eligible and screened-valid responses", () => {
    const progress = calculateConstituencyProgress(55, {
      rawReceipts: 540,
      accepted: 520,
      validRetainedEligible: 490,
      pendingReview: 10,
      duplicate: 15,
      invalid: 5,
      withdrawn: 8,
      excluded: 12,
      latestSuccessfulProcessingAt: null,
      processingFailures: 2,
    });
    expect(progress.remaining).toBe(10);
    expect(progress.targetReached).toBe(false);
    expect(progress.intakeHealth).toBe("degraded");
  });

  it("supports progress reporting for every statewide constituency", () => {
    const progress = calculateConstituencyProgress(1, {
      rawReceipts: 1,
      accepted: 1,
      validRetainedEligible: 1,
      pendingReview: 0,
      duplicate: 0,
      invalid: 0,
      withdrawn: 0,
      excluded: 0,
      latestSuccessfulProcessingAt: "2026-11-07T10:00:00.000Z",
      processingFailures: 0,
    });
    expect(progress.assemblySegmentName).toBe("Sujanpur");
    expect(progress.remaining).toBe(499);
  });
});

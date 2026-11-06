import { fatehgarhSahibSegments } from "@/data/fatehgarh-sahib";

export const TARGET_VALID_SUBMISSIONS_PER_CONSTITUENCY = 500;
export const NUMBER_OF_CONSTITUENCIES = 9;
export const TOTAL_MINIMUM_TARGET =
  TARGET_VALID_SUBMISSIONS_PER_CONSTITUENCY * NUMBER_OF_CONSTITUENCIES;
export const MAX_SUBMISSIONS_PER_CONSTITUENCY = null;

export const eligibleAssemblySegmentNumbers = fatehgarhSahibSegments.map(
  ({ number }) => number,
);

export type EligibleAssemblySegmentNumber =
  (typeof eligibleAssemblySegmentNumbers)[number];

export type SubmissionCounts = {
  rawReceipts: number;
  accepted: number;
  validRetainedEligible: number;
  pendingReview: number;
  duplicate: number;
  invalid: number;
  withdrawn: number;
  excluded: number;
  latestSuccessfulProcessingAt: string | null;
  processingFailures: number;
};

export type ConstituencyProgress = SubmissionCounts & {
  assemblySegmentNumber: number;
  assemblySegmentName: string;
  target: number;
  remaining: number;
  targetAchievementPercentage: number;
  targetReached: boolean;
  intakeHealth: "healthy" | "degraded" | "no_data";
};

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer`);
  }
}

export function calculateConstituencyProgress(
  assemblySegmentNumber: number,
  counts: SubmissionCounts,
): ConstituencyProgress {
  const segment = fatehgarhSahibSegments.find(
    ({ number }) => number === assemblySegmentNumber,
  );
  if (!segment)
    throw new Error("Assembly segment is outside the approved scope");

  for (const [label, value] of Object.entries(counts)) {
    if (typeof value === "number") assertNonNegativeInteger(value, label);
  }
  if (counts.accepted > counts.rawReceipts) {
    throw new Error("Accepted submissions cannot exceed raw receipts");
  }
  const classified =
    counts.validRetainedEligible +
    counts.pendingReview +
    counts.duplicate +
    counts.invalid +
    counts.withdrawn +
    counts.excluded;
  if (classified > counts.rawReceipts) {
    throw new Error("Classified outcomes cannot exceed raw receipts");
  }

  const valid = counts.validRetainedEligible;
  return {
    ...counts,
    assemblySegmentNumber,
    assemblySegmentName: segment.name,
    target: TARGET_VALID_SUBMISSIONS_PER_CONSTITUENCY,
    remaining: Math.max(0, TARGET_VALID_SUBMISSIONS_PER_CONSTITUENCY - valid),
    targetAchievementPercentage:
      (valid / TARGET_VALID_SUBMISSIONS_PER_CONSTITUENCY) * 100,
    targetReached: valid >= TARGET_VALID_SUBMISSIONS_PER_CONSTITUENCY,
    intakeHealth:
      counts.rawReceipts === 0
        ? "no_data"
        : counts.processingFailures > 0
          ? "degraded"
          : "healthy",
  };
}

/**
 * The target is a reporting goal, never an intake cap. Authorization, rate
 * limiting, validation and emergency-stop controls are evaluated elsewhere.
 */
export function targetAllowsAnotherEligibleSubmission(
  assemblySegmentNumber: number,
  currentValidCount: number,
): boolean {
  if (!eligibleAssemblySegmentNumbers.includes(assemblySegmentNumber)) {
    return false;
  }
  assertNonNegativeInteger(currentValidCount, "currentValidCount");
  return true;
}

export function recordSyntheticValidSubmission(
  counts: SubmissionCounts,
  assemblySegmentNumber: number,
): SubmissionCounts {
  if (
    !targetAllowsAnotherEligibleSubmission(
      assemblySegmentNumber,
      counts.validRetainedEligible,
    )
  ) {
    throw new Error("Assembly segment is outside the approved scope");
  }
  return {
    ...counts,
    rawReceipts: counts.rawReceipts + 1,
    accepted: counts.accepted + 1,
    validRetainedEligible: counts.validRetainedEligible + 1,
  };
}

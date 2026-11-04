import { fatehgarhSahibSegments } from "@/data/fatehgarh-sahib";

export type SuppressionReason = "small_cell" | "complementary" | null;

export type CategoryStatistic = {
  value: string;
  count: number | null;
  percentage: number | null;
  suppressed: boolean;
  suppressionReason: SuppressionReason;
};

export type CategorySummary = {
  denominator: number | null;
  missing: number | null;
  totalsSuppressed: boolean;
  categories: CategoryStatistic[];
};

export type SyntheticSurveyResponse = {
  id: string;
  assemblySegmentNumber: number;
  answers: Readonly<Record<string, string | null | undefined>>;
  duplicateReviewStatus: "included" | "pending_review" | "confirmed_duplicate";
};

export type SegmentReport = {
  assemblySegmentNumber: number;
  received: number | null;
  included: number | null;
  pendingDuplicateReview: number | null;
  confirmedDuplicatesExcluded: number | null;
  totalsSuppressed: boolean;
  answerSummary: CategorySummary;
};

export type VoluntarySurveyReport = {
  inferenceBasis: "voluntary_responses_not_representative_polling";
  electionPredictionPermitted: false;
  questionId: string;
  segments: SegmentReport[];
};

function validateThreshold(smallCellThreshold: number): void {
  if (!Number.isInteger(smallCellThreshold) || smallCellThreshold < 2) {
    throw new Error("smallCellThreshold must be an integer of at least 2");
  }
}

function publishCount(count: number, threshold: number): number | null {
  return count === 0 || count >= threshold ? count : null;
}

function isSmallPositive(count: number, threshold: number): boolean {
  return count > 0 && count < threshold;
}

export function summarizeCategories(
  values: readonly (string | null | undefined)[],
  options: { smallCellThreshold: number; complementarySuppression?: boolean },
): CategorySummary {
  validateThreshold(options.smallCellThreshold);
  const counts = new Map<string, number>();
  let missing = 0;

  for (const value of values) {
    const normalized = value?.trim();
    if (!normalized) {
      missing += 1;
      continue;
    }
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  const denominatorCount = values.length - missing;
  const denominator = publishCount(
    denominatorCount,
    options.smallCellThreshold,
  );
  const publishedMissing = publishCount(missing, options.smallCellThreshold);
  const sortedCounts = [...counts.entries()].sort(([left], [right]) =>
    left.localeCompare(right, "en"),
  );
  const primarySuppressed = new Set(
    sortedCounts
      .filter(([, count]) => count < options.smallCellThreshold)
      .map(([value]) => value),
  );
  const complementarySuppressed = new Set<string>();

  if (
    options.complementarySuppression !== false &&
    primarySuppressed.size === 1 &&
    sortedCounts.length > 1
  ) {
    const publishable = sortedCounts
      .filter(([value]) => !primarySuppressed.has(value))
      .sort(
        (left, right) =>
          left[1] - right[1] || left[0].localeCompare(right[0], "en"),
      );
    if (publishable[0]) complementarySuppressed.add(publishable[0][0]);
  }

  const categories = sortedCounts.map(([value, count]): CategoryStatistic => {
    const suppressionReason: SuppressionReason = primarySuppressed.has(value)
      ? "small_cell"
      : complementarySuppressed.has(value)
        ? "complementary"
        : null;
    const suppressed = suppressionReason !== null;

    return {
      value,
      count: suppressed ? null : count,
      percentage:
        suppressed || denominator === null || denominatorCount === 0
          ? null
          : Number(((count / denominatorCount) * 100).toFixed(1)),
      suppressed,
      suppressionReason,
    };
  });

  return {
    denominator,
    missing: publishedMissing,
    totalsSuppressed: denominator === null || publishedMissing === null,
    categories,
  };
}

export function createVoluntarySurveyReport(
  responses: readonly SyntheticSurveyResponse[],
  questionId: string,
  options: { smallCellThreshold: number },
): VoluntarySurveyReport {
  validateThreshold(options.smallCellThreshold);

  const segments = fatehgarhSahibSegments.map((segment): SegmentReport => {
    const received = responses.filter(
      ({ assemblySegmentNumber }) => assemblySegmentNumber === segment.number,
    );
    const included = received.filter(
      ({ duplicateReviewStatus }) => duplicateReviewStatus === "included",
    );
    const pendingDuplicateReview = received.filter(
      ({ duplicateReviewStatus }) => duplicateReviewStatus === "pending_review",
    ).length;
    const confirmedDuplicatesExcluded = received.filter(
      ({ duplicateReviewStatus }) =>
        duplicateReviewStatus === "confirmed_duplicate",
    ).length;
    const answerSummary = summarizeCategories(
      included.map(({ answers }) => answers[questionId]),
      {
        smallCellThreshold: options.smallCellThreshold,
        complementarySuppression: true,
      },
    );
    const relatedCounts = [
      received.length,
      included.length,
      pendingDuplicateReview,
      confirmedDuplicatesExcluded,
    ];
    const totalsSuppressed =
      answerSummary.totalsSuppressed ||
      relatedCounts.some((count) =>
        isSmallPositive(count, options.smallCellThreshold),
      );

    return {
      assemblySegmentNumber: segment.number,
      received: totalsSuppressed
        ? null
        : publishCount(received.length, options.smallCellThreshold),
      included: totalsSuppressed
        ? null
        : publishCount(included.length, options.smallCellThreshold),
      pendingDuplicateReview: totalsSuppressed
        ? null
        : publishCount(pendingDuplicateReview, options.smallCellThreshold),
      confirmedDuplicatesExcluded: totalsSuppressed
        ? null
        : publishCount(confirmedDuplicatesExcluded, options.smallCellThreshold),
      totalsSuppressed,
      answerSummary,
    };
  });

  return {
    inferenceBasis: "voluntary_responses_not_representative_polling",
    electionPredictionPermitted: false,
    questionId,
    segments,
  };
}

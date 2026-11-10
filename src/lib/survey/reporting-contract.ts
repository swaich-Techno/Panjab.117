import type { SurveyRoundId } from "./round-registry";

export const roundWorkbookTabs = [
  "Survey_Metadata",
  "Constituency_Registry",
  "Intake_Staging",
  "Consent_Operations",
  "Quality_Control",
  "Constituency_Summary_117",
  "Constituency_Mini_Dashboard",
  "Daily_Trend",
  "Voting_Opinion_Aggregates",
  "Source_And_Methodology",
  "Sync_Status",
] as const;

// Responses_Private is deliberately absent until confidential storage receives
// separate production approval.
export const confidentialWorkbookTabs = ["Responses_Private"] as const;

export const routingFieldIds = [
  "survey_round_id",
  "survey_instance_id",
  "assembly_constituency_number",
  "assembly_constituency_name",
  "parliamentary_constituency",
  "questionnaire_version",
  "response_or_aggregate_date_ist",
  "consent_version",
  "political_consent_status",
  "data_review_status",
  "collection_status",
] as const;

export const approvedAggregateFieldIds = [
  "survey_round_id",
  "assembly_constituency_number",
  "metric_id",
  "option_id",
  "approved_count",
  "eligible_sample_count",
  "reporting_date_ist",
  "questionnaire_version",
  "source_batch_id",
  "last_verified_at",
] as const;

export const PUBLIC_POLITICAL_MINIMUM_SAMPLE = 50;

export type ApprovedAggregateRow = {
  surveyRoundId: SurveyRoundId;
  assemblyConstituencyNumber: number;
  metricId: string;
  optionId: string;
  approvedCount: number;
  eligibleSampleCount: number;
  reportingDateIst: string;
  questionnaireVersion: string;
  sourceBatchId: string;
  lastVerifiedAt: string;
  politicalOpinion: boolean;
};

export type PublicAggregateRow = Omit<ApprovedAggregateRow, "approvedCount"> & {
  approvedCount: number | null;
  suppressed: boolean;
  suppressionReason: "small_political_sample" | null;
};

function assertCount(value: number, field: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative safe integer`);
  }
}

export function validateApprovedAggregate(row: ApprovedAggregateRow): void {
  assertCount(row.approvedCount, "approvedCount");
  assertCount(row.eligibleSampleCount, "eligibleSampleCount");
  if (row.approvedCount > row.eligibleSampleCount) {
    throw new Error("Approved count cannot exceed the eligible sample");
  }
  if (
    row.assemblyConstituencyNumber < 1 ||
    row.assemblyConstituencyNumber > 117
  ) {
    throw new Error("Assembly constituency must be between 1 and 117");
  }
  for (const value of [row.metricId, row.optionId, row.sourceBatchId]) {
    if (!/^[a-z0-9][a-z0-9._:-]{1,127}$/u.test(value)) {
      throw new Error("Aggregate identifiers must use stable machine codes");
    }
  }
}

export function toPublicAggregate(
  row: ApprovedAggregateRow,
): PublicAggregateRow {
  validateApprovedAggregate(row);
  const suppressed =
    row.politicalOpinion &&
    (row.eligibleSampleCount < PUBLIC_POLITICAL_MINIMUM_SAMPLE ||
      row.approvedCount < PUBLIC_POLITICAL_MINIMUM_SAMPLE);
  return {
    ...row,
    approvedCount: suppressed ? null : row.approvedCount,
    suppressed,
    suppressionReason: suppressed ? "small_political_sample" : null,
  };
}

export function mergeAggregateBatches(
  current: readonly ApprovedAggregateRow[],
  incoming: readonly ApprovedAggregateRow[],
): readonly ApprovedAggregateRow[] {
  const rows = new Map<string, ApprovedAggregateRow>();
  for (const row of [...current, ...incoming]) {
    validateApprovedAggregate(row);
    const key = [
      row.surveyRoundId,
      row.assemblyConstituencyNumber,
      row.metricId,
      row.optionId,
      row.reportingDateIst,
      row.sourceBatchId,
    ].join("|");
    rows.set(key, row);
  }
  return [...rows.values()].sort((left, right) =>
    `${left.surveyRoundId}-${left.assemblyConstituencyNumber}-${left.metricId}-${left.optionId}`.localeCompare(
      `${right.surveyRoundId}-${right.assemblyConstituencyNumber}-${right.metricId}-${right.optionId}`,
    ),
  );
}

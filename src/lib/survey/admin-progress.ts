import {
  calculateConstituencyProgress,
  eligibleAssemblySegmentNumbers,
  type ConstituencyProgress,
  type SubmissionCounts,
} from "./collection-targets";

export type AdminProgressPrincipal = {
  authenticated: boolean;
  subject: string;
  permissions: readonly string[];
};

export type AdminProgressDashboard = {
  generatedAt: string;
  syntheticOnly: boolean;
  constituencies: readonly ConstituencyProgress[];
  alerts: readonly string[];
};

export class AdminProgressAuthorizationError extends Error {
  constructor() {
    super("Administrator progress access is not authorized");
    this.name = "AdminProgressAuthorizationError";
  }
}

export function buildAdminProgressDashboard(input: {
  principal: AdminProgressPrincipal;
  generatedAt: string;
  syntheticOnly: boolean;
  countsBySegment: ReadonlyMap<number, SubmissionCounts>;
}): AdminProgressDashboard {
  if (
    !input.principal.authenticated ||
    input.principal.subject.length < 8 ||
    !input.principal.permissions.includes("survey:progress:read")
  ) {
    throw new AdminProgressAuthorizationError();
  }
  if (!input.syntheticOnly) {
    throw new Error(
      "This development projection may only process synthetic evidence",
    );
  }

  const constituencies = eligibleAssemblySegmentNumbers.map((number) => {
    const counts = input.countsBySegment.get(number);
    if (!counts)
      throw new Error(`Missing progress counts for segment ${number}`);
    return calculateConstituencyProgress(number, counts);
  });
  const alerts = constituencies.flatMap((item) =>
    item.intakeHealth === "degraded"
      ? [`Segment ${item.assemblySegmentNumber} has processing failures`]
      : [],
  );
  return {
    generatedAt: input.generatedAt,
    syntheticOnly: true,
    constituencies,
    alerts,
  };
}

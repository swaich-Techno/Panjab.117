export const surveyStates = [
  "draft",
  "scheduled",
  "open",
  "paused",
  "closed",
  "archived",
] as const;

export type SurveyState = (typeof surveyStates)[number];

export type OperationalApprovals = {
  productionSecurity: boolean;
  privacy: boolean;
  consent: boolean;
  backupAndRecovery: boolean;
  operations: boolean;
};

export type SurveySchedule = {
  timeZone: "Asia/Kolkata";
  localOpening: string;
  localClosingDisplay: string;
  opensAt: string;
  closesAtExclusive: string;
  state: SurveyState;
  launchApproved: boolean;
  approvals: OperationalApprovals;
};

export const fatehgarhSahibDraftSchedule: SurveySchedule = {
  timeZone: "Asia/Kolkata",
  localOpening: "2026-11-05 00:00:00",
  localClosingDisplay: "2026-11-15 23:59:59",
  opensAt: "2026-11-04T18:30:00.000Z",
  closesAtExclusive: "2026-11-15T18:30:00.000Z",
  state: "draft",
  launchApproved: false,
  approvals: {
    productionSecurity: false,
    privacy: false,
    consent: false,
    backupAndRecovery: false,
    operations: false,
  },
};

export type SurveyAvailability = {
  state: SurveyState;
  intakeEnabled: boolean;
  reason:
    | "draft"
    | "before_window"
    | "launch_not_approved"
    | "operational_approvals_missing"
    | "state_not_open"
    | "available"
    | "paused"
    | "window_closed"
    | "closed"
    | "archived";
};

function allOperationalApprovalsGranted(approvals: OperationalApprovals) {
  return Object.values(approvals).every(Boolean);
}

export function getSurveyAvailability(
  schedule: SurveySchedule,
  now: Date,
): SurveyAvailability {
  if (schedule.state === "archived") {
    return { state: "archived", intakeEnabled: false, reason: "archived" };
  }

  if (schedule.state === "paused") {
    return { state: "paused", intakeEnabled: false, reason: "paused" };
  }

  if (schedule.state === "closed") {
    return { state: "closed", intakeEnabled: false, reason: "closed" };
  }

  if (schedule.state === "draft") {
    return { state: "draft", intakeEnabled: false, reason: "draft" };
  }

  const currentTime = now.getTime();
  const openingTime = new Date(schedule.opensAt).getTime();
  const closingTime = new Date(schedule.closesAtExclusive).getTime();

  if (currentTime < openingTime) {
    return {
      state: "scheduled",
      intakeEnabled: false,
      reason: "before_window",
    };
  }

  if (currentTime >= closingTime) {
    return {
      state: "closed",
      intakeEnabled: false,
      reason: "window_closed",
    };
  }

  if (!schedule.launchApproved) {
    return {
      state: "scheduled",
      intakeEnabled: false,
      reason: "launch_not_approved",
    };
  }

  if (!allOperationalApprovalsGranted(schedule.approvals)) {
    return {
      state: "scheduled",
      intakeEnabled: false,
      reason: "operational_approvals_missing",
    };
  }

  if (schedule.state !== "open") {
    return {
      state: "scheduled",
      intakeEnabled: false,
      reason: "state_not_open",
    };
  }

  return { state: "open", intakeEnabled: true, reason: "available" };
}

export class SurveyUnavailableError extends Error {
  constructor(reason: SurveyAvailability["reason"]) {
    super(`Survey intake unavailable: ${reason}`);
    this.name = "SurveyUnavailableError";
  }
}

export function assertSurveyIntakeAllowed(
  schedule: SurveySchedule,
  now: Date,
): void {
  const availability = getSurveyAvailability(schedule, now);

  if (!availability.intakeEnabled) {
    throw new SurveyUnavailableError(availability.reason);
  }
}

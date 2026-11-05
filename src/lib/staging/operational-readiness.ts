import { operationalApprovalDomains } from "@/lib/survey/launch-authorization";

export type OperationalHealth = {
  checkedAt: Date;
  databaseReachable: boolean;
  secretProviderReachable: boolean;
  civicKeyProviderReachable: boolean;
  politicalKeyProviderReachable: boolean;
  pendingOutboxEvents: number;
  oldestPendingOutboxAgeMs: number;
  deadLetterEvents: number;
  lastSuccessfulBackupAt: Date | null;
  deletionLedgerBacklog: number;
};

export type PrivacySafeAlert = {
  code:
    | "DATABASE_UNAVAILABLE"
    | "SECRET_PROVIDER_UNAVAILABLE"
    | "KEY_PROVIDER_UNAVAILABLE"
    | "OUTBOX_BACKLOG"
    | "OUTBOX_DEAD_LETTER"
    | "BACKUP_STALE_OR_MISSING"
    | "DELETION_REPLAY_BACKLOG";
  severity: "warning" | "critical";
  observedAt: string;
};

export function evaluateOperationalHealth(
  health: OperationalHealth,
): readonly PrivacySafeAlert[] {
  if (!Number.isFinite(health.checkedAt.getTime())) {
    throw new Error("Invalid operational-health timestamp");
  }
  const alerts: PrivacySafeAlert[] = [];
  const push = (
    code: PrivacySafeAlert["code"],
    severity: PrivacySafeAlert["severity"],
  ) =>
    alerts.push({ code, severity, observedAt: health.checkedAt.toISOString() });

  if (!health.databaseReachable) push("DATABASE_UNAVAILABLE", "critical");
  if (!health.secretProviderReachable) {
    push("SECRET_PROVIDER_UNAVAILABLE", "critical");
  }
  if (
    !health.civicKeyProviderReachable ||
    !health.politicalKeyProviderReachable
  ) {
    push("KEY_PROVIDER_UNAVAILABLE", "critical");
  }
  if (
    health.pendingOutboxEvents > 100 ||
    health.oldestPendingOutboxAgeMs > 5 * 60 * 1000
  ) {
    push("OUTBOX_BACKLOG", "warning");
  }
  if (health.deadLetterEvents > 0) push("OUTBOX_DEAD_LETTER", "critical");
  if (
    health.lastSuccessfulBackupAt === null ||
    health.checkedAt.getTime() - health.lastSuccessfulBackupAt.getTime() >
      24 * 60 * 60 * 1000
  ) {
    push("BACKUP_STALE_OR_MISSING", "critical");
  }
  if (health.deletionLedgerBacklog > 0) {
    push("DELETION_REPLAY_BACKLOG", "critical");
  }
  return alerts;
}

export type LaunchDecisionInput = {
  liveSurveyCollectionEnabled: boolean;
  launchApproved: boolean;
  operationalApprovals: Readonly<Record<string, boolean>>;
  signedEvidenceVerified: boolean;
  releaseBindingVerified: boolean;
  independentReviewsComplete: boolean;
  infrastructureEvidenceComplete: boolean;
  emergencyShutdownReady: boolean;
};

export function evaluateLaunchDecision(input: LaunchDecisionInput): {
  authorized: boolean;
  blockers: readonly string[];
} {
  const blockers: string[] = [];
  if (!input.liveSurveyCollectionEnabled)
    blockers.push("collection flag is false");
  if (!input.launchApproved) blockers.push("final launch approval is false");
  if (
    Object.keys(input.operationalApprovals).length !==
      operationalApprovalDomains.length ||
    !operationalApprovalDomains.every(
      (domain) => input.operationalApprovals[domain] === true,
    )
  ) {
    blockers.push("one or more operational approvals are absent");
  }
  if (!input.signedEvidenceVerified)
    blockers.push("signed evidence is unverified");
  if (!input.releaseBindingVerified)
    blockers.push("release binding is unverified");
  if (!input.independentReviewsComplete) {
    blockers.push("independent reviews are incomplete");
  }
  if (!input.infrastructureEvidenceComplete) {
    blockers.push("infrastructure evidence is incomplete");
  }
  if (!input.emergencyShutdownReady) {
    blockers.push("emergency shutdown is unverified");
  }
  return { authorized: blockers.length === 0, blockers };
}

export class EmergencyCollectionController {
  #syntheticStagingEnabled = false;

  enableSyntheticStaging(scope: "synthetic_local_only"): void {
    if (scope !== "synthetic_local_only")
      throw new Error("Invalid staging scope");
    this.#syntheticStagingEnabled = true;
  }

  disable(): void {
    this.#syntheticStagingEnabled = false;
  }

  assertSyntheticStagingEnabled(): void {
    if (!this.#syntheticStagingEnabled) {
      throw new Error("Synthetic staging collection is stopped");
    }
  }

  isEnabled(): boolean {
    return this.#syntheticStagingEnabled;
  }
}

import { describe, expect, it } from "vitest";

import {
  EmergencyCollectionController,
  evaluateLaunchDecision,
  evaluateOperationalHealth,
} from "./operational-readiness";

describe("Step 5E operational readiness", () => {
  it("emits privacy-safe alerts for every critical dependency", () => {
    const alerts = evaluateOperationalHealth({
      checkedAt: new Date("2026-11-05T12:00:00.000Z"),
      databaseReachable: false,
      secretProviderReachable: false,
      civicKeyProviderReachable: true,
      politicalKeyProviderReachable: false,
      pendingOutboxEvents: 101,
      oldestPendingOutboxAgeMs: 6 * 60 * 1000,
      deadLetterEvents: 1,
      lastSuccessfulBackupAt: null,
      deletionLedgerBacklog: 1,
    });
    expect(alerts.map(({ code }) => code)).toEqual([
      "DATABASE_UNAVAILABLE",
      "SECRET_PROVIDER_UNAVAILABLE",
      "KEY_PROVIDER_UNAVAILABLE",
      "OUTBOX_BACKLOG",
      "OUTBOX_DEAD_LETTER",
      "BACKUP_STALE_OR_MISSING",
      "DELETION_REPLAY_BACKLOG",
    ]);
    expect(JSON.stringify(alerts)).not.toMatch(
      /answer|withdrawalCode|politicalOpinion/u,
    );
  });

  it("does not authorize production from flags without all evidence", () => {
    const decision = evaluateLaunchDecision({
      liveSurveyCollectionEnabled: true,
      launchApproved: true,
      operationalApprovals: {
        production_security: true,
        privacy: true,
        consent: true,
        backup_and_recovery: true,
        operations: true,
      },
      signedEvidenceVerified: false,
      releaseBindingVerified: false,
      independentReviewsComplete: false,
      infrastructureEvidenceComplete: false,
      emergencyShutdownReady: false,
    });
    expect(decision.authorized).toBe(false);
    expect(decision.blockers).toHaveLength(5);
  });

  it("starts only synthetic staging and supports immediate shutdown", () => {
    const controller = new EmergencyCollectionController();
    expect(() => controller.assertSyntheticStagingEnabled()).toThrow();
    controller.enableSyntheticStaging("synthetic_local_only");
    expect(controller.isEnabled()).toBe(true);
    controller.disable();
    expect(controller.isEnabled()).toBe(false);
  });
});

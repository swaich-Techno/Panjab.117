import { describe, expect, it } from "vitest";

import { fatehgarhSahibDraftSchedule } from "./schedule";
import {
  assertProductionLaunchEvidence,
  currentCollectionControls,
  LaunchAuthorizationError,
} from "./launch-authorization";

describe("Step 5C production launch authorization", () => {
  it("keeps preview enabled while every collection approval remains false", () => {
    expect(currentCollectionControls).toEqual({
      publicPreviewEnabled: true,
      liveSurveyCollectionEnabled: false,
      launchApproved: false,
      operationalApprovals: {
        production_security: false,
        privacy: false,
        consent: false,
        backup_and_recovery: false,
        operations: false,
      },
      aiProviderEnabled: false,
    });
    expect(fatehgarhSahibDraftSchedule.launchApproved).toBe(false);
    expect(Object.values(fatehgarhSahibDraftSchedule.approvals)).not.toContain(
      true,
    );
  });

  it("fails closed when evidence is absent and ignores environment toggles", () => {
    process.env.LIVE_SURVEY_COLLECTION_ENABLED = "true";
    expect(() =>
      assertProductionLaunchEvidence(null, {
        now: new Date("2026-11-05T00:00:00.000Z"),
        deploymentCommitSha: "a".repeat(40),
        deploymentImageDigest: `sha256:${"b".repeat(64)}`,
      }),
    ).toThrow(LaunchAuthorizationError);
    expect(currentCollectionControls.liveSurveyCollectionEnabled).toBe(false);
    delete process.env.LIVE_SURVEY_COLLECTION_ENABLED;
  });
});

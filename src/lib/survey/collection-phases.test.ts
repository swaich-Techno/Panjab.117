import { describe, expect, it } from "vitest";

import { currentCollectionControls } from "./launch-authorization";
import {
  collectionPhases,
  evaluateCollectionPhaseActivation,
  type PhaseActivationControls,
} from "./collection-phases";

const approvedControls: PhaseActivationControls = {
  liveSurveyCollectionEnabled: true,
  finalLaunchApproved: true,
  operationalApprovals: {
    production_security: true,
    privacy: true,
    consent: true,
    backup_and_recovery: true,
    operations: true,
  },
  releaseBoundApprovalVerified: true,
  infrastructureHealthy: true,
  emergencyStopReady: true,
  authorizedOperatorAction: "activate",
};

describe("independent collection phase controls", () => {
  it("defines nine-segment and statewide targets without double-counting", () => {
    const phaseOne = collectionPhases.fatehgarh_sahib;
    const phaseTwo = collectionPhases.punjab_statewide;
    expect(phaseOne.assemblySegmentNumbers).toEqual([
      54, 55, 56, 57, 58, 59, 67, 69, 106,
    ]);
    expect(phaseOne.totalMinimum).toBe(4_500);
    expect(phaseTwo.assemblySegmentNumbers).toHaveLength(117);
    expect(new Set(phaseTwo.assemblySegmentNumbers).size).toBe(117);
    expect(
      phaseOne.assemblySegmentNumbers.every((number) =>
        phaseTwo.assemblySegmentNumbers.includes(number),
      ),
    ).toBe(true);
    expect(phaseTwo.totalMinimum).toBe(58_500);
  });

  it("keeps both checked-in phases disabled regardless of the planned date", () => {
    for (const phase of Object.values(collectionPhases)) {
      const result = evaluateCollectionPhaseActivation(phase, approvedControls);
      expect(phase.enabled).toBe(false);
      expect(phase.launchApproved).toBe(false);
      expect(result.authorized).toBe(false);
      expect(result.blockers).toContain("phase is disabled");
      expect(result.blockers).toContain("phase launch approval is false");
    }
  });

  it("fails closed with the current global collection controls", () => {
    const result = evaluateCollectionPhaseActivation(
      {
        ...collectionPhases.fatehgarh_sahib,
        enabled: true,
        launchApproved: true,
      },
      {
        ...approvedControls,
        liveSurveyCollectionEnabled:
          currentCollectionControls.liveSurveyCollectionEnabled,
        finalLaunchApproved: currentCollectionControls.launchApproved,
        operationalApprovals: currentCollectionControls.operationalApprovals,
      },
    );
    expect(result.authorized).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "live collection is disabled",
        "final collection approval is false",
        "operational approvals are incomplete",
      ]),
    );
  });

  it("requires a healthy release-bound manual activation for one phase only", () => {
    const approvedPhaseOne = {
      ...collectionPhases.fatehgarh_sahib,
      enabled: true,
      launchApproved: true,
    };
    expect(
      evaluateCollectionPhaseActivation(approvedPhaseOne, approvedControls),
    ).toEqual({ authorized: true, blockers: [] });
    expect(
      evaluateCollectionPhaseActivation(
        collectionPhases.punjab_statewide,
        approvedControls,
      ).authorized,
    ).toBe(false);
  });
});

import { constituencies } from "@/data/constituencies";

import { operationalApprovalDomains } from "./launch-authorization";
import {
  eligibleAssemblySegmentNumbers,
  STATEWIDE_TOTAL_MINIMUM_TARGET,
  TARGET_VALID_SUBMISSIONS_PER_CONSTITUENCY,
  TOTAL_MINIMUM_TARGET,
} from "./collection-targets";

export const collectionPhaseIds = [
  "fatehgarh_sahib",
  "punjab_statewide",
] as const;

export type CollectionPhaseId = (typeof collectionPhaseIds)[number];

export type CollectionPhaseConfiguration = {
  id: CollectionPhaseId;
  plannedStart: string;
  assemblySegmentNumbers: readonly number[];
  minimumPerSegment: number;
  totalMinimum: number;
  enabled: boolean;
  launchApproved: boolean;
};

export const collectionPhases: Readonly<
  Record<CollectionPhaseId, CollectionPhaseConfiguration>
> = {
  fatehgarh_sahib: {
    id: "fatehgarh_sahib",
    plannedStart: "2026-11-10T00:00:00+05:30",
    assemblySegmentNumbers: eligibleAssemblySegmentNumbers,
    minimumPerSegment: TARGET_VALID_SUBMISSIONS_PER_CONSTITUENCY,
    totalMinimum: TOTAL_MINIMUM_TARGET,
    enabled: false,
    launchApproved: false,
  },
  punjab_statewide: {
    id: "punjab_statewide",
    plannedStart: "2026-11-15T00:00:00+05:30",
    assemblySegmentNumbers: constituencies.map(({ number }) => number),
    minimumPerSegment: TARGET_VALID_SUBMISSIONS_PER_CONSTITUENCY,
    totalMinimum: STATEWIDE_TOTAL_MINIMUM_TARGET,
    enabled: false,
    launchApproved: false,
  },
} as const;

export type PhaseActivationControls = {
  liveSurveyCollectionEnabled: boolean;
  finalLaunchApproved: boolean;
  operationalApprovals: Readonly<Record<string, boolean>>;
  releaseBoundApprovalVerified: boolean;
  infrastructureHealthy: boolean;
  emergencyStopReady: boolean;
  authorizedOperatorAction: "none" | "activate";
};

export function evaluateCollectionPhaseActivation(
  phase: CollectionPhaseConfiguration,
  controls: PhaseActivationControls,
): { authorized: boolean; blockers: readonly string[] } {
  const blockers: string[] = [];
  if (!phase.enabled) blockers.push("phase is disabled");
  if (!phase.launchApproved) blockers.push("phase launch approval is false");
  if (!controls.liveSurveyCollectionEnabled) {
    blockers.push("live collection is disabled");
  }
  if (!controls.finalLaunchApproved) {
    blockers.push("final collection approval is false");
  }
  if (
    !operationalApprovalDomains.every(
      (domain) => controls.operationalApprovals[domain] === true,
    )
  ) {
    blockers.push("operational approvals are incomplete");
  }
  if (!controls.releaseBoundApprovalVerified) {
    blockers.push("release-bound approval is unverified");
  }
  if (!controls.infrastructureHealthy) {
    blockers.push("production infrastructure is unhealthy or unverified");
  }
  if (!controls.emergencyStopReady) {
    blockers.push("emergency stop is unverified");
  }
  if (controls.authorizedOperatorAction !== "activate") {
    blockers.push("authorized operator activation is absent");
  }
  return { authorized: blockers.length === 0, blockers };
}

import { describe, expect, it } from "vitest";

import {
  isProductionRegistrationAllowed,
  registrationPilotPolicy,
} from "./policy";

describe("registration pilot policy", () => {
  it("keeps public intake, AI and every approval gate disabled", () => {
    expect(registrationPilotPolicy.publicRegistrationEnabled).toBe(false);
    expect(registrationPilotPolicy.productionDatabaseConfigured).toBe(false);
    expect(registrationPilotPolicy.externalAiEnabled).toBe(false);
    expect(registrationPilotPolicy.finalLaunchApproval).toBe(false);
    expect(Object.values(registrationPilotPolicy.operationalApprovals)).toEqual(
      [false, false, false, false, false],
    );
    expect(isProductionRegistrationAllowed()).toBe(false);
  });

  it("defines one configurable 100-person cap across nine segments", () => {
    expect(
      registrationPilotPolicy.capacity.maximumConfirmedPerTopLevelCategory,
    ).toBe(100);
    expect(
      registrationPilotPolicy.capacity.assemblyConstituencyNumbers,
    ).toHaveLength(9);
    expect(
      registrationPilotPolicy.capacity.appliesToGeneralCivicQuestionnaire,
    ).toBe(false);
  });
});

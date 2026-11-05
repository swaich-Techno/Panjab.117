import { fatehgarhSahibParliamentaryGroup } from "@/data/fatehgarh-sahib";

export const registrationPilotPolicy = {
  version: "party-registration-pilot-2026-11-05-v1",
  mode: "synthetic_only",
  publicRegistrationEnabled: false,
  productionDatabaseConfigured: false,
  externalAiEnabled: false,
  emergencyStopActive: true,
  finalLaunchApproval: false,
  operationalApprovals: {
    productionSecurity: false,
    privacy: false,
    consent: false,
    backupAndRecovery: false,
    operations: false,
  },
  capacity: {
    maximumConfirmedPerTopLevelCategory: 100,
    geographicScope: "fatehgarh_sahib_nine_assembly_segment_pilot",
    assemblyConstituencyNumbers:
      fatehgarhSahibParliamentaryGroup.assemblyConstituencyNumbers,
    appliesToGeneralCivicQuestionnaire: false,
    releasePolicy:
      "A confirmed place is released only after a verified withdrawal is committed. Declined, invalid, duplicate and unconfirmed attempts never consume capacity.",
  },
} as const;

export function isProductionRegistrationAllowed(): boolean {
  return (
    registrationPilotPolicy.publicRegistrationEnabled &&
    registrationPilotPolicy.productionDatabaseConfigured &&
    !registrationPilotPolicy.emergencyStopActive &&
    registrationPilotPolicy.finalLaunchApproval &&
    Object.values(registrationPilotPolicy.operationalApprovals).every(Boolean)
  );
}

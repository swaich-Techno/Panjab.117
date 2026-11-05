import {
  currentCollectionControls,
  operationalApprovalDomains,
  type OperationalApprovalDomain,
} from "@/lib/survey/launch-authorization";

export const step5ECollectionControls = {
  ...currentCollectionControls,
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
  budgetInr: 0,
} as const;

export type ExternalReference = `ref://${string}`;
export type SecretReference = `secret://${string}`;
export type EvidenceReference = `evidence://${string}`;

export type ProductionIntegrationContract = {
  environment: "production";
  release: {
    commitSha: string;
    imageDigest: string;
    signedApprovalEvidenceRef: EvidenceReference;
  };
  intake: {
    privateService: true;
    publicDatabaseAccess: false;
    minimumTlsVersion: "TLSv1.3";
    certificateSecretRef: SecretReference;
    emergencyShutdownEnabled: true;
  };
  database: {
    engine: "mysql";
    version: "8.4";
    host: string;
    port: 3306;
    privateNetworkOnly: true;
    verifyServerCertificate: true;
    caBundleSecretRef: SecretReference;
    credentialsSecretRef: SecretReference;
    privateConnectivityEvidenceRef: EvidenceReference;
    pointInTimeRecovery: true;
  };
  workloadIdentity: {
    serviceIdentity: string;
    audience: string;
    staticAccessKeysAllowed: false;
    identityPolicyRef: ExternalReference;
  };
  keyManagement: {
    civic: {
      keyRef: ExternalReference;
      authorizationBoundary: string;
    };
    political: {
      keyRef: ExternalReference;
      authorizationBoundary: string;
    };
    backup: {
      keyRef: ExternalReference;
      authorizationBoundary: string;
    };
    keyMaterialExportable: false;
  };
  durability: {
    transactionalOutbox: true;
    durableRateAndScreeningState: true;
    encryptedBackups: true;
    restoreQuarantine: true;
    deletionLedgerReplay: true;
    recoveryTestEvidenceRef: EvidenceReference;
  };
  monitoring: {
    privacySafeLogs: true;
    databaseAlertRef: ExternalReference;
    outboxAlertRef: ExternalReference;
    backupAlertRef: ExternalReference;
    keyAndSecretAlertRef: ExternalReference;
  };
};

export type LocalSyntheticStagingConfiguration = {
  mode: "local_synthetic_staging";
  bindHost: "127.0.0.1" | "::1";
  origin: string;
  databaseHost: "127.0.0.1" | "::1";
  databaseVersion: "8.4.13";
  tlsRequired: true;
  syntheticDataOnly: true;
  browserPersistenceEnabled: false;
  productionApprovalEvidenceAccepted: false;
  externalNetworkAllowed: false;
  aiProviderEnabled: false;
};

export const localSyntheticStagingConfiguration: LocalSyntheticStagingConfiguration =
  {
    mode: "local_synthetic_staging",
    bindHost: "127.0.0.1",
    origin: "https://127.0.0.1:4175",
    databaseHost: "127.0.0.1",
    databaseVersion: "8.4.13",
    tlsRequired: true,
    syntheticDataOnly: true,
    browserPersistenceEnabled: false,
    productionApprovalEvidenceAccepted: false,
    externalNetworkAllowed: false,
    aiProviderEnabled: false,
  };

export class IntegrationContractError extends Error {
  constructor(readonly issues: readonly string[]) {
    super("Production integration contract is incomplete or unsafe");
    this.name = "IntegrationContractError";
  }
}

function validReference(value: string, scheme: string): boolean {
  return (
    value.startsWith(`${scheme}://`) &&
    value.length >= scheme.length + 12 &&
    !/[\s"'<>]/u.test(value)
  );
}

function privateAddress(host: string): boolean {
  if (/^10\.(?:\d{1,3}\.){2}\d{1,3}$/u.test(host)) return true;
  if (/^192\.168\.(?:\d{1,3})\.(?:\d{1,3})$/u.test(host)) return true;
  const match = /^172\.(\d{1,3})\.(?:\d{1,3})\.(?:\d{1,3})$/u.exec(host);
  if (match && Number(match[1]) >= 16 && Number(match[1]) <= 31) return true;
  return /(?:^|\.)(?:internal|private)$/u.test(host);
}

export function assertLocalSyntheticStagingConfiguration(
  value: LocalSyntheticStagingConfiguration,
): void {
  const origin = new URL(value.origin);
  if (
    value.mode !== "local_synthetic_staging" ||
    !["127.0.0.1", "::1"].includes(value.bindHost) ||
    !["127.0.0.1", "::1"].includes(value.databaseHost) ||
    origin.protocol !== "https:" ||
    !["127.0.0.1", "[::1]"].includes(origin.hostname) ||
    !value.tlsRequired ||
    !value.syntheticDataOnly ||
    value.browserPersistenceEnabled ||
    value.productionApprovalEvidenceAccepted ||
    value.externalNetworkAllowed ||
    value.aiProviderEnabled
  ) {
    throw new IntegrationContractError([
      "Local staging must remain loopback-only, TLS-only and synthetic-only",
    ]);
  }
}

export function assertProductionIntegrationContract(
  contract: ProductionIntegrationContract,
): void {
  const issues: string[] = [];
  if (!/^[a-f0-9]{40}$/u.test(contract.release.commitSha)) {
    issues.push("release commit SHA must be exact");
  }
  if (!/^sha256:[a-f0-9]{64}$/u.test(contract.release.imageDigest)) {
    issues.push("release image digest must be exact");
  }
  if (!validReference(contract.release.signedApprovalEvidenceRef, "evidence")) {
    issues.push("signed launch evidence must be external");
  }
  if (
    !contract.intake.privateService ||
    contract.intake.publicDatabaseAccess ||
    contract.intake.minimumTlsVersion !== "TLSv1.3" ||
    !contract.intake.emergencyShutdownEnabled
  ) {
    issues.push("intake transport or shutdown control is unsafe");
  }
  if (
    !privateAddress(contract.database.host) ||
    !contract.database.privateNetworkOnly ||
    !contract.database.verifyServerCertificate ||
    !contract.database.pointInTimeRecovery
  ) {
    issues.push("database private-network, TLS or recovery control is missing");
  }
  const secretRefs = [
    contract.intake.certificateSecretRef,
    contract.database.caBundleSecretRef,
    contract.database.credentialsSecretRef,
  ];
  if (secretRefs.some((value) => !validReference(value, "secret"))) {
    issues.push("inline or invalid secret reference");
  }
  if (
    !validReference(
      contract.database.privateConnectivityEvidenceRef,
      "evidence",
    ) ||
    !validReference(contract.durability.recoveryTestEvidenceRef, "evidence")
  ) {
    issues.push("network or recovery evidence is missing");
  }
  if (
    contract.workloadIdentity.staticAccessKeysAllowed ||
    contract.workloadIdentity.serviceIdentity.length < 8 ||
    contract.workloadIdentity.audience.length < 8 ||
    !validReference(contract.workloadIdentity.identityPolicyRef, "ref")
  ) {
    issues.push("workload identity is incomplete");
  }
  const keyDomains = [
    contract.keyManagement.civic,
    contract.keyManagement.political,
    contract.keyManagement.backup,
  ];
  if (
    contract.keyManagement.keyMaterialExportable ||
    new Set(keyDomains.map(({ keyRef }) => keyRef)).size !==
      keyDomains.length ||
    new Set(
      keyDomains.map(({ authorizationBoundary }) => authorizationBoundary),
    ).size !== keyDomains.length ||
    keyDomains.some(({ keyRef }) => !validReference(keyRef, "ref"))
  ) {
    issues.push("civic, political and backup key domains are not separated");
  }
  if (
    !contract.durability.transactionalOutbox ||
    !contract.durability.durableRateAndScreeningState ||
    !contract.durability.encryptedBackups ||
    !contract.durability.restoreQuarantine ||
    !contract.durability.deletionLedgerReplay
  ) {
    issues.push("durability controls must all be enabled");
  }
  if (
    !contract.monitoring.privacySafeLogs ||
    Object.entries(contract.monitoring)
      .filter(([name]) => name.endsWith("Ref"))
      .some(([, value]) => !validReference(String(value), "ref"))
  ) {
    issues.push("privacy-safe monitoring references are incomplete");
  }
  if (issues.length > 0) throw new IntegrationContractError(issues);
}

export function productionFlagsRemainDisabled(): boolean {
  const approvals: Readonly<Record<OperationalApprovalDomain, boolean>> =
    step5ECollectionControls.operationalApprovals;
  return (
    !step5ECollectionControls.liveSurveyCollectionEnabled &&
    !step5ECollectionControls.launchApproved &&
    operationalApprovalDomains.every((domain) => !approvals[domain]) &&
    !step5ECollectionControls.aiProviderEnabled
  );
}

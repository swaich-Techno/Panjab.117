import { describe, expect, it } from "vitest";

import {
  assertLocalSyntheticStagingConfiguration,
  assertProductionIntegrationContract,
  IntegrationContractError,
  localSyntheticStagingConfiguration,
  productionFlagsRemainDisabled,
  step5ECollectionControls,
  type LocalSyntheticStagingConfiguration,
  type ProductionIntegrationContract,
} from "./production-integration";

function validProductionContract(): ProductionIntegrationContract {
  return {
    environment: "production",
    release: {
      commitSha: "a".repeat(40),
      imageDigest: `sha256:${"b".repeat(64)}`,
      signedApprovalEvidenceRef: "evidence://release/approval-bundle-0001",
    },
    intake: {
      privateService: true,
      publicDatabaseAccess: false,
      minimumTlsVersion: "TLSv1.3",
      certificateSecretRef: "secret://intake/tls-certificate",
      emergencyShutdownEnabled: true,
    },
    database: {
      engine: "mysql",
      version: "8.4",
      host: "10.24.0.12",
      port: 3306,
      privateNetworkOnly: true,
      verifyServerCertificate: true,
      caBundleSecretRef: "secret://database/mysql-ca-bundle",
      credentialsSecretRef: "secret://database/intake-workload-credential",
      privateConnectivityEvidenceRef:
        "evidence://network/private-connectivity-0001",
      pointInTimeRecovery: true,
    },
    workloadIdentity: {
      serviceIdentity: "survey-intake-production",
      audience: "panjab117-private-intake",
      staticAccessKeysAllowed: false,
      identityPolicyRef: "ref://iam/intake-workload-policy",
    },
    keyManagement: {
      civic: {
        keyRef: "ref://kms/civic-answer-key",
        authorizationBoundary: "civic-security-team",
      },
      political: {
        keyRef: "ref://kms/political-answer-key",
        authorizationBoundary: "political-data-custodians",
      },
      backup: {
        keyRef: "ref://kms/backup-key",
        authorizationBoundary: "recovery-custodians",
      },
      keyMaterialExportable: false,
    },
    durability: {
      transactionalOutbox: true,
      durableRateAndScreeningState: true,
      encryptedBackups: true,
      restoreQuarantine: true,
      deletionLedgerReplay: true,
      recoveryTestEvidenceRef: "evidence://recovery/quarterly-test-0001",
    },
    monitoring: {
      privacySafeLogs: true,
      databaseAlertRef: "ref://monitoring/database-alert",
      outboxAlertRef: "ref://monitoring/outbox-alert",
      backupAlertRef: "ref://monitoring/backup-alert",
      keyAndSecretAlertRef: "ref://monitoring/key-secret-alert",
    },
  };
}

describe("Step 5E integration contracts", () => {
  it("keeps the checked-in launch, operational and AI controls disabled", () => {
    expect(productionFlagsRemainDisabled()).toBe(true);
    expect(step5ECollectionControls.budgetInr).toBe(0);
    expect(step5ECollectionControls.operationalApprovals).toEqual({
      production_security: false,
      privacy: false,
      consent: false,
      backup_and_recovery: false,
      operations: false,
    });
  });

  it("accepts only loopback, TLS-only, synthetic local staging", () => {
    expect(() =>
      assertLocalSyntheticStagingConfiguration(
        localSyntheticStagingConfiguration,
      ),
    ).not.toThrow();
    expect(() =>
      assertLocalSyntheticStagingConfiguration({
        ...localSyntheticStagingConfiguration,
        externalNetworkAllowed: true,
      } as unknown as LocalSyntheticStagingConfiguration),
    ).toThrow(IntegrationContractError);
  });

  it("validates a complete production contract without activating it", () => {
    expect(() =>
      assertProductionIntegrationContract(validProductionContract()),
    ).not.toThrow();
    expect(productionFlagsRemainDisabled()).toBe(true);
  });

  it("rejects public database hosts, inline secrets and shared key domains", () => {
    const unsafe = validProductionContract();
    unsafe.database.host = "db.example.com";
    unsafe.database.credentialsSecretRef =
      "plaintext-password" as ProductionIntegrationContract["database"]["credentialsSecretRef"];
    unsafe.keyManagement.political = { ...unsafe.keyManagement.civic };
    expect(() => assertProductionIntegrationContract(unsafe)).toThrowError(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.stringContaining("database private-network"),
          expect.stringContaining("secret reference"),
          expect.stringContaining("key domains"),
        ]),
      }),
    );
  });
});

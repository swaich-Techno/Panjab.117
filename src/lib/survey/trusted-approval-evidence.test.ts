import { generateKeyPairSync, sign, type KeyObject } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  CONSENT_NOTICE_DIGEST,
  CONSENT_NOTICE_VERSION,
  proposedAgePolicy,
} from "./consent";
import {
  LaunchAuthorizationError,
  operationalApprovalDomains,
  type ApprovalEvidence,
  type ProductionLaunchEvidence,
} from "./launch-authorization";
import { QUESTIONNAIRE_VERSION } from "./questionnaire";
import {
  approvalAttestationPayload,
  SignedApprovalEvidenceProvider,
  type SignedProductionLaunchBundle,
  type TrustedApprovalAuthority,
} from "./trusted-approval-evidence";

const commit = "a".repeat(40);
const image = `sha256:${"b".repeat(64)}`;
const domains: readonly ApprovalEvidence["domain"][] = [
  ...operationalApprovalDomains,
  "final_launch",
];

function bundleFixture(): {
  bundle: SignedProductionLaunchBundle;
  authorities: TrustedApprovalAuthority[];
  privateKeys: Map<string, KeyObject>;
} {
  const approvals: ApprovalEvidence[] = domains.map((domain, index) => ({
    approvalId: `approval-${String(index).padStart(2, "0")}-step5d`,
    domain,
    decision: "approved",
    scope: "production",
    evidenceSha256: String(index + 1)
      .repeat(64)
      .slice(0, 64),
    signerSubject: `idp:authority:${domain}`,
    approvedAt: "2026-11-04T00:00:00.000Z",
    expiresAt: "2026-11-06T00:00:00.000Z",
    revokedAt: null,
  }));
  const evidence: ProductionLaunchEvidence = {
    recordId: "step5d-production-evidence-0001",
    scope: "production",
    deploymentCommitSha: commit,
    deploymentImageDigest: image,
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    consentNoticeVersion: CONSENT_NOTICE_VERSION,
    consentNoticeDigest: CONSENT_NOTICE_DIGEST,
    agePolicyVersion: proposedAgePolicy.version,
    approvals,
  };
  const privateKeys = new Map<string, KeyObject>();
  const authorities = approvals.map((approval) => {
    const pair = generateKeyPairSync("ed25519");
    privateKeys.set(approval.signerSubject, pair.privateKey);
    return {
      subject: approval.signerSubject,
      allowedDomains: [approval.domain],
      publicKeyPem: pair.publicKey
        .export({ type: "spki", format: "pem" })
        .toString(),
    };
  });
  const attestations = approvals.map((approval) => ({
    approvalId: approval.approvalId,
    signerSubject: approval.signerSubject,
    signature: sign(
      null,
      approvalAttestationPayload(evidence, approval),
      privateKeys.get(approval.signerSubject)!,
    ).toString("base64url"),
  }));
  return { bundle: { evidence, attestations }, authorities, privateKeys };
}

function provider(
  fixture: ReturnType<typeof bundleFixture>,
  bundle: SignedProductionLaunchBundle | null = fixture.bundle,
) {
  return new SignedApprovalEvidenceProvider(
    { readSignedBundle: async () => bundle },
    fixture.authorities,
    {
      deploymentCommitSha: commit,
      deploymentImageDigest: image,
      now: () => new Date("2026-11-05T00:00:00.000Z"),
    },
  );
}

describe("Step 5D trusted approval evidence", () => {
  it("verifies signatures, authority domains and exact release bindings", async () => {
    const fixture = bundleFixture();
    await expect(provider(fixture).readVerifiedEvidence()).resolves.toEqual(
      fixture.bundle.evidence,
    );
  });

  it("rejects forged signatures and unauthorized signer domains", async () => {
    const fixture = bundleFixture();
    const forged: SignedProductionLaunchBundle = {
      ...fixture.bundle,
      attestations: fixture.bundle.attestations.map((entry, index) =>
        index === 0 ? { ...entry, signature: "A".repeat(86) } : entry,
      ),
    };
    await expect(
      provider(fixture, forged).readVerifiedEvidence(),
    ).rejects.toBeInstanceOf(LaunchAuthorizationError);

    const unauthorized = fixture.authorities.map((authority, index) =>
      index === 0
        ? { ...authority, allowedDomains: ["privacy" as const] }
        : authority,
    );
    await expect(
      new SignedApprovalEvidenceProvider(
        { readSignedBundle: async () => fixture.bundle },
        unauthorized,
        {
          deploymentCommitSha: commit,
          deploymentImageDigest: image,
          now: () => new Date("2026-11-05T00:00:00.000Z"),
        },
      ).readVerifiedEvidence(),
    ).rejects.toBeInstanceOf(LaunchAuthorizationError);
  });

  it("rejects stale, revoked and wrong-deployment evidence even when re-signed", async () => {
    for (const mutate of [
      (approval: ApprovalEvidence): ApprovalEvidence => ({
        ...approval,
        expiresAt: "2026-11-04T12:00:00.000Z",
      }),
      (approval: ApprovalEvidence): ApprovalEvidence => ({
        ...approval,
        revokedAt: "2026-11-04T12:00:00.000Z",
      }),
    ]) {
      const fixture = bundleFixture();
      const approvals = fixture.bundle.evidence.approvals.map(
        (approval, index) => (index === 0 ? mutate(approval) : approval),
      );
      const evidence = { ...fixture.bundle.evidence, approvals };
      const attestations = approvals.map((approval) => ({
        approvalId: approval.approvalId,
        signerSubject: approval.signerSubject,
        signature: sign(
          null,
          approvalAttestationPayload(evidence, approval),
          fixture.privateKeys.get(approval.signerSubject)!,
        ).toString("base64url"),
      }));
      await expect(
        provider(fixture, { evidence, attestations }).readVerifiedEvidence(),
      ).rejects.toBeInstanceOf(LaunchAuthorizationError);
    }

    const fixture = bundleFixture();
    const wrongEvidence = {
      ...fixture.bundle.evidence,
      deploymentCommitSha: "c".repeat(40),
    };
    const attestations = wrongEvidence.approvals.map((approval) => ({
      approvalId: approval.approvalId,
      signerSubject: approval.signerSubject,
      signature: sign(
        null,
        approvalAttestationPayload(wrongEvidence, approval),
        fixture.privateKeys.get(approval.signerSubject)!,
      ).toString("base64url"),
    }));
    await expect(
      provider(fixture, {
        evidence: wrongEvidence,
        attestations,
      }).readVerifiedEvidence(),
    ).rejects.toBeInstanceOf(LaunchAuthorizationError);
  });
});

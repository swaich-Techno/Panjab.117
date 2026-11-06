import { createPublicKey, verify } from "node:crypto";

import {
  assertProductionLaunchEvidence,
  LaunchAuthorizationError,
  type ApprovalEvidence,
  type ProductionLaunchEvidence,
  type ProductionLaunchEvidenceProvider,
} from "./launch-authorization";

export type SignedApprovalAttestation = {
  approvalId: string;
  signerSubject: string;
  signature: string;
};

export type SignedProductionLaunchBundle = {
  evidence: ProductionLaunchEvidence;
  attestations: readonly SignedApprovalAttestation[];
};

export type TrustedApprovalAuthority = {
  subject: string;
  allowedDomains: readonly ApprovalEvidence["domain"][];
  publicKeyPem: string;
};

export function approvalAttestationPayload(
  evidence: ProductionLaunchEvidence,
  approval: ApprovalEvidence,
): Buffer {
  return Buffer.from(
    JSON.stringify([
      "panjab117-production-approval-v1",
      evidence.recordId,
      evidence.scope,
      evidence.deploymentCommitSha,
      evidence.deploymentImageDigest,
      evidence.questionnaireVersion,
      evidence.consentNoticeVersion,
      evidence.consentNoticeDigest,
      evidence.agePolicyVersion,
      approval.approvalId,
      approval.domain,
      approval.decision,
      approval.scope,
      approval.evidenceSha256,
      approval.signerSubject,
      approval.approvedAt,
      approval.expiresAt,
      approval.revokedAt,
    ]),
    "utf8",
  );
}

function assertTrustedBundle(
  bundle: SignedProductionLaunchBundle,
  authorities: ReadonlyMap<string, TrustedApprovalAuthority>,
): void {
  if (
    bundle.attestations.length !== bundle.evidence.approvals.length ||
    new Set(bundle.attestations.map(({ approvalId }) => approvalId)).size !==
      bundle.attestations.length
  ) {
    throw new LaunchAuthorizationError();
  }
  for (const approval of bundle.evidence.approvals) {
    const attestation = bundle.attestations.find(
      ({ approvalId }) => approvalId === approval.approvalId,
    );
    const authority = authorities.get(approval.signerSubject);
    if (
      !attestation ||
      !authority ||
      attestation.signerSubject !== approval.signerSubject ||
      !authority.allowedDomains.includes(approval.domain) ||
      !/^[A-Za-z0-9_-]{86}$/u.test(attestation.signature)
    ) {
      throw new LaunchAuthorizationError();
    }
    try {
      const verified = verify(
        null,
        approvalAttestationPayload(bundle.evidence, approval),
        createPublicKey(authority.publicKeyPem),
        Buffer.from(attestation.signature, "base64url"),
      );
      if (!verified) throw new LaunchAuthorizationError();
    } catch (error) {
      if (error instanceof LaunchAuthorizationError) throw error;
      throw new LaunchAuthorizationError();
    }
  }
}

export class SignedApprovalEvidenceProvider implements ProductionLaunchEvidenceProvider {
  readonly #authorities: ReadonlyMap<string, TrustedApprovalAuthority>;

  constructor(
    private readonly source: {
      readSignedBundle(): Promise<SignedProductionLaunchBundle | null>;
    },
    authorities: readonly TrustedApprovalAuthority[],
    private readonly expected: {
      deploymentCommitSha: string;
      deploymentImageDigest: string;
      now: () => Date;
    },
  ) {
    if (
      authorities.length === 0 ||
      new Set(authorities.map(({ subject }) => subject)).size !==
        authorities.length
    ) {
      throw new Error("Trusted approval authorities must be unique");
    }
    this.#authorities = new Map(
      authorities.map((authority) => [authority.subject, authority]),
    );
  }

  async readVerifiedEvidence(): Promise<ProductionLaunchEvidence | null> {
    const bundle = await this.source.readSignedBundle();
    if (!bundle) return null;
    assertTrustedBundle(bundle, this.#authorities);
    assertProductionLaunchEvidence(bundle.evidence, {
      now: this.expected.now(),
      deploymentCommitSha: this.expected.deploymentCommitSha,
      deploymentImageDigest: this.expected.deploymentImageDigest,
    });
    return bundle.evidence;
  }
}

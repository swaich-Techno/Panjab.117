import {
  CONSENT_NOTICE_DIGEST,
  CONSENT_NOTICE_VERSION,
  proposedAgePolicy,
} from "./consent";
import { QUESTIONNAIRE_VERSION } from "./questionnaire";

export const operationalApprovalDomains = [
  "production_security",
  "privacy",
  "consent",
  "backup_and_recovery",
  "operations",
] as const;

export type OperationalApprovalDomain =
  (typeof operationalApprovalDomains)[number];

export const currentCollectionControls = {
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
} as const;

export type ApprovalEvidence = {
  approvalId: string;
  domain: OperationalApprovalDomain | "final_launch";
  decision: "approved";
  scope: "production";
  evidenceSha256: string;
  signerSubject: string;
  approvedAt: string;
  expiresAt: string;
  revokedAt: string | null;
};

export type ProductionLaunchEvidence = {
  recordId: string;
  scope: "production";
  deploymentCommitSha: string;
  deploymentImageDigest: string;
  questionnaireVersion: typeof QUESTIONNAIRE_VERSION;
  consentNoticeVersion: typeof CONSENT_NOTICE_VERSION;
  consentNoticeDigest: typeof CONSENT_NOTICE_DIGEST;
  agePolicyVersion: typeof proposedAgePolicy.version;
  approvals: readonly ApprovalEvidence[];
};

export class LaunchAuthorizationError extends Error {
  constructor() {
    super("Production survey collection is not authorized");
    this.name = "LaunchAuthorizationError";
  }
}

function validTimestamp(value: string): number {
  const result = Date.parse(value);
  if (!Number.isFinite(result)) throw new LaunchAuthorizationError();
  return result;
}

function assertApproval(
  approval: ApprovalEvidence,
  expectedDomain: ApprovalEvidence["domain"],
  now: Date,
): void {
  if (
    approval.domain !== expectedDomain ||
    approval.decision !== "approved" ||
    approval.scope !== "production" ||
    approval.revokedAt !== null ||
    !/^[A-Za-z0-9_-]{16,128}$/u.test(approval.approvalId) ||
    !/^[A-Za-z0-9:@._-]{8,256}$/u.test(approval.signerSubject) ||
    !/^[a-f0-9]{64}$/u.test(approval.evidenceSha256)
  ) {
    throw new LaunchAuthorizationError();
  }
  const approvedAt = validTimestamp(approval.approvedAt);
  const expiresAt = validTimestamp(approval.expiresAt);
  if (
    approvedAt > now.getTime() ||
    expiresAt <= now.getTime() ||
    expiresAt <= approvedAt
  ) {
    throw new LaunchAuthorizationError();
  }
}

export function assertProductionLaunchEvidence(
  evidence: ProductionLaunchEvidence | null,
  input: {
    now: Date;
    deploymentCommitSha: string;
    deploymentImageDigest: string;
  },
): asserts evidence is ProductionLaunchEvidence {
  if (
    evidence === null ||
    evidence.scope !== "production" ||
    !/^[A-Za-z0-9_-]{16,128}$/u.test(evidence.recordId) ||
    !/^[a-f0-9]{40}$/u.test(input.deploymentCommitSha) ||
    !/^sha256:[a-f0-9]{64}$/u.test(input.deploymentImageDigest) ||
    evidence.deploymentCommitSha !== input.deploymentCommitSha ||
    evidence.deploymentImageDigest !== input.deploymentImageDigest ||
    evidence.questionnaireVersion !== QUESTIONNAIRE_VERSION ||
    evidence.consentNoticeVersion !== CONSENT_NOTICE_VERSION ||
    evidence.consentNoticeDigest !== CONSENT_NOTICE_DIGEST ||
    evidence.agePolicyVersion !== proposedAgePolicy.version
  ) {
    throw new LaunchAuthorizationError();
  }

  const expectedDomains: readonly ApprovalEvidence["domain"][] = [
    ...operationalApprovalDomains,
    "final_launch",
  ];
  if (
    evidence.approvals.length !== expectedDomains.length ||
    new Set(evidence.approvals.map(({ domain }) => domain)).size !==
      expectedDomains.length
  ) {
    throw new LaunchAuthorizationError();
  }
  for (const domain of expectedDomains) {
    const approval = evidence.approvals.find(
      (candidate) => candidate.domain === domain,
    );
    if (!approval) throw new LaunchAuthorizationError();
    assertApproval(approval, domain, input.now);
  }
}

export interface ProductionLaunchEvidenceProvider {
  readVerifiedEvidence(): Promise<ProductionLaunchEvidence | null>;
}

import { createHash, randomUUID } from "node:crypto";

import {
  assertUsableScreeningRetentionPolicy,
  type ScreeningRetentionDomain,
  type ScreeningRetentionPolicy,
} from "@/lib/survey/screening-retention";

export type ExpiredScreeningClaim = {
  claimId: string;
  domain: ScreeningRetentionDomain;
  windowEnd: string;
};

export interface ScreeningCleanupStore {
  deleteExpiredClaims(input: {
    cutoff: Date;
    limit: number;
  }): Promise<readonly ExpiredScreeningClaim[]>;
  recordCleanupEvidence(evidence: ScreeningCleanupEvidence): Promise<void>;
}

export type ScreeningCleanupEvidence = {
  cleanupId: string;
  policyId: string;
  policyVersion: number;
  policySha256: string;
  cutoffAt: string;
  deletedClaimCount: number;
  ranAt: string;
  syntheticOnly: true;
};

function policyDigest(policy: ScreeningRetentionPolicy): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        policy.policyId,
        policy.version,
        policy.scope,
        policy.state,
        policy.effectiveAt,
        policy.expiresAt,
        policy.approval,
        policy.windows,
      ]),
      "utf8",
    )
    .digest("hex");
}

export async function runBoundedSyntheticScreeningCleanup(input: {
  policy: ScreeningRetentionPolicy;
  store: ScreeningCleanupStore;
  now: Date;
  limit?: number;
  createCleanupId?: () => string;
}): Promise<ScreeningCleanupEvidence> {
  if (input.policy.scope !== "synthetic_test") {
    throw new Error("Production screening cleanup is not authorized");
  }
  assertUsableScreeningRetentionPolicy(input.policy, input.now);
  const limit = input.limit ?? 500;
  if (!Number.isInteger(limit) || limit < 1 || limit > 1_000) {
    throw new Error("Cleanup limit must be between 1 and 1000");
  }
  const deleted = await input.store.deleteExpiredClaims({
    cutoff: input.now,
    limit,
  });
  if (
    deleted.length > limit ||
    deleted.some(({ windowEnd }) => Date.parse(windowEnd) > input.now.getTime())
  ) {
    throw new Error("Cleanup store returned an invalid deletion set");
  }
  const evidence: ScreeningCleanupEvidence = {
    cleanupId: input.createCleanupId?.() ?? randomUUID(),
    policyId: input.policy.policyId,
    policyVersion: input.policy.version,
    policySha256: policyDigest(input.policy),
    cutoffAt: input.now.toISOString(),
    deletedClaimCount: deleted.length,
    ranAt: input.now.toISOString(),
    syntheticOnly: true,
  };
  await input.store.recordCleanupEvidence(evidence);
  return evidence;
}

export class InMemoryScreeningCleanupStore implements ScreeningCleanupStore {
  readonly #claims = new Map<string, ExpiredScreeningClaim>();
  readonly #evidence: ScreeningCleanupEvidence[] = [];
  readonly liveWithdrawalRecordCount: number;

  constructor(
    claims: readonly ExpiredScreeningClaim[],
    liveWithdrawalRecordCount = 1,
  ) {
    claims.forEach((claim) => this.#claims.set(claim.claimId, { ...claim }));
    this.liveWithdrawalRecordCount = liveWithdrawalRecordCount;
  }

  async deleteExpiredClaims(input: {
    cutoff: Date;
    limit: number;
  }): Promise<readonly ExpiredScreeningClaim[]> {
    const expired = [...this.#claims.values()]
      .filter(
        ({ windowEnd }) => Date.parse(windowEnd) <= input.cutoff.getTime(),
      )
      .sort((left, right) => left.claimId.localeCompare(right.claimId))
      .slice(0, input.limit);
    expired.forEach(({ claimId }) => this.#claims.delete(claimId));
    return expired;
  }

  async recordCleanupEvidence(
    evidence: ScreeningCleanupEvidence,
  ): Promise<void> {
    this.#evidence.push({ ...evidence });
  }

  snapshot(): {
    claims: readonly ExpiredScreeningClaim[];
    evidence: readonly ScreeningCleanupEvidence[];
    liveWithdrawalRecordCount: number;
  } {
    return {
      claims: [...this.#claims.values()].map((claim) => ({ ...claim })),
      evidence: this.#evidence.map((evidence) => ({ ...evidence })),
      liveWithdrawalRecordCount: this.liveWithdrawalRecordCount,
    };
  }
}

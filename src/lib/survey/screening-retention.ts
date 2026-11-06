export const screeningRetentionDomains = [
  "idempotency",
  "answer_duplicate",
  "rate_limit",
] as const;

export type ScreeningRetentionDomain =
  (typeof screeningRetentionDomains)[number];

export type ScreeningRetentionPolicy = {
  policyId: string;
  version: number;
  scope: "production" | "synthetic_test";
  state:
    | "draft"
    | "approved_for_synthetic_testing"
    | "approved_for_production"
    | "revoked";
  effectiveAt: string;
  expiresAt: string;
  approval: null | {
    reference: string;
    approvedAt: string;
    approvedByRole: "privacy_security_joint_review";
  };
  windows: Readonly<
    Record<
      ScreeningRetentionDomain,
      { retentionMs: number; alignment: "policy_bucket" | "utc_bucket" }
    >
  >;
};

export type ScreeningRetentionWindow = {
  start: Date;
  end: Date;
  seenAt: Date;
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const productionScreeningRetentionPolicyDraft: ScreeningRetentionPolicy =
  {
    policyId: "panjab117-screening-retention-production",
    version: 1,
    scope: "production",
    state: "draft",
    effectiveAt: "2026-11-05T00:00:00.000Z",
    expiresAt: "2027-11-05T00:00:00.000Z",
    approval: null,
    windows: {
      idempotency: { retentionMs: 30 * DAY_MS, alignment: "policy_bucket" },
      answer_duplicate: {
        retentionMs: 30 * DAY_MS,
        alignment: "policy_bucket",
      },
      rate_limit: { retentionMs: HOUR_MS, alignment: "utc_bucket" },
    },
  };

export const syntheticScreeningRetentionPolicy: ScreeningRetentionPolicy = {
  ...productionScreeningRetentionPolicyDraft,
  policyId: "panjab117-screening-retention-synthetic-step5c",
  scope: "synthetic_test",
  state: "approved_for_synthetic_testing",
  effectiveAt: "2026-11-01T00:00:00.000Z",
  expiresAt: "2027-12-01T00:00:00.000Z",
  approval: {
    reference: "synthetic-step5c-policy-review",
    approvedAt: "2026-11-01T00:00:00.000Z",
    approvedByRole: "privacy_security_joint_review",
  },
};

function parsedDate(value: string, label: string): Date {
  const result = new Date(value);
  if (!Number.isFinite(result.getTime())) throw new Error(`Invalid ${label}`);
  return result;
}

export function assertUsableScreeningRetentionPolicy(
  policy: ScreeningRetentionPolicy,
  observedAt: Date,
): void {
  if (!Number.isFinite(observedAt.getTime())) {
    throw new Error("Invalid screening observation time");
  }
  if (policy.scope !== "production" && policy.scope !== "synthetic_test") {
    throw new Error("Invalid screening retention policy scope");
  }
  const requiredState =
    policy.scope === "production"
      ? "approved_for_production"
      : "approved_for_synthetic_testing";
  if (policy.state !== requiredState || policy.approval === null) {
    throw new Error("Screening retention policy is not approved for its scope");
  }
  if (
    policy.approval.approvedByRole !== "privacy_security_joint_review" ||
    !/^[a-z0-9][a-z0-9-]{7,127}$/u.test(policy.approval.reference)
  ) {
    throw new Error("Invalid screening retention approval");
  }
  const effectiveAt = parsedDate(policy.effectiveAt, "policy effective time");
  const expiresAt = parsedDate(policy.expiresAt, "policy expiry time");
  const approvedAt = parsedDate(
    policy.approval.approvedAt,
    "policy approval time",
  );
  if (
    approvedAt > effectiveAt ||
    expiresAt <= effectiveAt ||
    observedAt < effectiveAt ||
    observedAt >= expiresAt
  ) {
    throw new Error("Screening retention policy is not effective");
  }
  for (const domain of screeningRetentionDomains) {
    const window = policy.windows[domain];
    if (!Number.isSafeInteger(window.retentionMs) || window.retentionMs <= 0) {
      throw new Error(`Invalid ${domain} retention duration`);
    }
    if (domain === "rate_limit" && window.retentionMs > DAY_MS) {
      throw new Error("Rate-limit retention cannot exceed 24 hours");
    }
    if (domain !== "rate_limit" && window.retentionMs > 366 * DAY_MS) {
      throw new Error("Screening retention cannot exceed 366 days");
    }
    if (
      (domain === "rate_limit" && window.alignment !== "utc_bucket") ||
      (domain !== "rate_limit" && window.alignment !== "policy_bucket")
    ) {
      throw new Error(`Invalid ${domain} retention alignment`);
    }
  }
}

export function screeningRetentionWindow(
  policy: ScreeningRetentionPolicy,
  domain: ScreeningRetentionDomain,
  observedAt: Date,
): ScreeningRetentionWindow {
  assertUsableScreeningRetentionPolicy(policy, observedAt);
  const configured = policy.windows[domain];
  const policyEnd = parsedDate(policy.expiresAt, "policy expiry time");
  if (configured.alignment === "utc_bucket") {
    const startMs =
      Math.floor(observedAt.getTime() / configured.retentionMs) *
      configured.retentionMs;
    return {
      start: new Date(startMs),
      end: new Date(
        Math.min(startMs + configured.retentionMs, policyEnd.getTime()),
      ),
      seenAt: observedAt,
    };
  }
  const policyStart = parsedDate(
    policy.effectiveAt,
    "policy effective time",
  ).getTime();
  const startMs =
    policyStart +
    Math.floor((observedAt.getTime() - policyStart) / configured.retentionMs) *
      configured.retentionMs;
  return {
    start: new Date(startMs),
    end: new Date(
      Math.min(startMs + configured.retentionMs, policyEnd.getTime()),
    ),
    seenAt: observedAt,
  };
}

import { describe, expect, it } from "vitest";

import {
  assertUsableScreeningRetentionPolicy,
  productionScreeningRetentionPolicyDraft,
  screeningRetentionWindow,
  syntheticScreeningRetentionPolicy,
} from "./screening-retention";

const observedAt = new Date("2026-11-05T12:34:56.000Z");

describe("screening retention policy", () => {
  it("fails closed while the production policy remains a draft", () => {
    expect(productionScreeningRetentionPolicyDraft.approval).toBeNull();
    expect(() =>
      assertUsableScreeningRetentionPolicy(
        productionScreeningRetentionPolicyDraft,
        observedAt,
      ),
    ).toThrow("not approved");
  });

  it("derives durable and rate windows from the synthetic policy", () => {
    expect(
      screeningRetentionWindow(
        syntheticScreeningRetentionPolicy,
        "answer_duplicate",
        observedAt,
      ).end.toISOString(),
    ).toBe("2026-12-01T00:00:00.000Z");
    expect(
      screeningRetentionWindow(
        syntheticScreeningRetentionPolicy,
        "rate_limit",
        observedAt,
      ).start.toISOString(),
    ).toBe("2026-11-05T12:00:00.000Z");
    expect(
      screeningRetentionWindow(
        syntheticScreeningRetentionPolicy,
        "answer_duplicate",
        new Date("2026-12-02T00:00:00.000Z"),
      ).start.toISOString(),
    ).toBe("2026-12-01T00:00:00.000Z");
  });

  it("rejects expired and revoked policies", () => {
    expect(() =>
      screeningRetentionWindow(
        syntheticScreeningRetentionPolicy,
        "idempotency",
        new Date("2028-01-01T00:00:00.000Z"),
      ),
    ).toThrow("not effective");
    expect(() =>
      assertUsableScreeningRetentionPolicy(
        { ...syntheticScreeningRetentionPolicy, state: "revoked" },
        observedAt,
      ),
    ).toThrow("not approved");
  });
});

import { describe, expect, it } from "vitest";

import {
  InMemoryClaimStore,
  InMemoryDigestStore,
  screenSyntheticSubmission,
  type RateLimiter,
} from "./duplicate-screening";

const allowRateLimit: RateLimiter = {
  async check() {
    return { allowed: true };
  },
};

const fixture = {
  idempotencyKey: "synthetic-request-1",
  surveyVersionId: "synthetic-v1",
  constituencyNumber: 54,
  canonicalAnswerPayload: '{"synthetic":"answer-a"}',
  privacyScopeToken: "synthetic-scope",
};

describe("deterministic duplicate screening", () => {
  it("accepts a first synthetic submission without retaining raw identifiers", async () => {
    const result = await screenSyntheticSubmission(fixture, {
      idempotencyStore: new InMemoryClaimStore(),
      duplicateStore: new InMemoryDigestStore(),
      rateLimiter: allowRateLimit,
    });

    expect(result.acceptedForReview).toBe(true);
    expect(result.flags).toEqual([]);
    expect(JSON.stringify(result.logEvent)).not.toContain(
      fixture.idempotencyKey,
    );
    expect(JSON.stringify(result.logEvent)).not.toContain(
      fixture.privacyScopeToken,
    );
  });

  it("explains replay and duplicate flags without automatic deletion", async () => {
    const stores = {
      idempotencyStore: new InMemoryClaimStore(),
      duplicateStore: new InMemoryDigestStore(),
      rateLimiter: allowRateLimit,
    };
    await screenSyntheticSubmission(fixture, stores);
    const repeated = await screenSyntheticSubmission(fixture, stores);

    expect(repeated.flags.map(({ code }) => code)).toEqual([
      "replayed_idempotency_key",
      "duplicate_payload",
    ]);
    expect(repeated.automaticallyDeleted).toBe(false);
    expect(repeated.review).toEqual({ required: true, appealAvailable: true });
  });

  it("exposes a rate-limit flag through a provider-neutral interface", async () => {
    const deniedRateLimit: RateLimiter = {
      async check() {
        return { allowed: false, retryAfterMs: 60_000 };
      },
    };
    const result = await screenSyntheticSubmission(
      { ...fixture, idempotencyKey: "synthetic-request-2" },
      {
        idempotencyStore: new InMemoryClaimStore(),
        duplicateStore: new InMemoryDigestStore(),
        rateLimiter: deniedRateLimit,
      },
    );
    expect(result.flags[0]?.code).toBe("rate_limited");
  });
});

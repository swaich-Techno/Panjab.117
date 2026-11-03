import { describe, expect, it } from "vitest";

import {
  InMemoryAtomicSignalStore,
  ScreeningKeyRing,
  screenSyntheticSubmission,
  type RateLimiter,
} from "./duplicate-screening";

const allowRateLimit: RateLimiter = {
  async check() {
    return { allowed: true };
  },
};

const activeKey = {
  id: "synthetic-k2",
  key: Buffer.alloc(32, 2),
  status: "active",
} as const;
const retainedKey = {
  id: "synthetic-k1",
  key: Buffer.alloc(32, 1),
  status: "retained_for_duplicate_window",
} as const;

const keyRing = new ScreeningKeyRing([activeKey, retainedKey]);

const fixture = {
  idempotencyKey: "synthetic-request-1",
  surveyVersionId: "synthetic-v1",
  constituencyNumber: 54,
  canonicalAnswerPayload: '{"synthetic":"answer-a"}',
  privacyScopeToken: "synthetic-scope",
};

function stores() {
  return {
    keyRing,
    idempotencyStore: new InMemoryAtomicSignalStore(),
    duplicateStore: new InMemoryAtomicSignalStore(),
    rateLimiter: allowRateLimit,
  };
}

describe("keyed atomic duplicate screening", () => {
  it("accepts a first synthetic submission without retaining raw identifiers", async () => {
    const result = await screenSyntheticSubmission(fixture, stores());

    expect(result.acceptedForReview).toBe(true);
    expect(result.flags).toEqual([]);
    expect(JSON.stringify(result.logEvent)).not.toContain(
      fixture.idempotencyKey,
    );
    expect(JSON.stringify(result.logEvent)).not.toContain(
      fixture.privacyScopeToken,
    );
    expect(result.logEvent.signalKeyId).toBe("synthetic-k2");
  });

  it("atomically allows only one of many concurrent synthetic replays", async () => {
    const dependencies = stores();
    const results = await Promise.all(
      Array.from({ length: 20 }, () =>
        screenSyntheticSubmission(fixture, dependencies),
      ),
    );

    expect(
      results.filter(({ acceptedForReview }) => acceptedForReview),
    ).toHaveLength(1);
    expect(
      results.filter(({ flags }) =>
        flags.some(({ code }) => code === "replayed_idempotency_key"),
      ),
    ).toHaveLength(19);
    expect(
      results.filter(({ flags }) =>
        flags.some(({ code }) => code === "duplicate_payload"),
      ),
    ).toHaveLength(0);
    expect(
      results.every(({ automaticallyDeleted }) => !automaticallyDeleted),
    ).toBe(true);
  });

  it("scopes idempotency and duplicate claims to a survey version", async () => {
    const dependencies = stores();
    const first = await screenSyntheticSubmission(fixture, dependencies);
    const otherVersion = await screenSyntheticSubmission(
      { ...fixture, surveyVersionId: "synthetic-v2" },
      dependencies,
    );

    expect(first.acceptedForReview).toBe(true);
    expect(otherVersion.acceptedForReview).toBe(true);
  });

  it("flags matching answers submitted under a new idempotency key", async () => {
    const dependencies = stores();
    await screenSyntheticSubmission(fixture, dependencies);

    const duplicate = await screenSyntheticSubmission(
      { ...fixture, idempotencyKey: "synthetic-request-2" },
      dependencies,
    );

    expect(duplicate.flags.map(({ code }) => code)).toEqual([
      "duplicate_payload",
    ]);
    expect(duplicate.automaticallyDeleted).toBe(false);
  });

  it("detects a previous signal through a retained rotation key", async () => {
    const idempotencyStore = new InMemoryAtomicSignalStore();
    const duplicateStore = new InMemoryAtomicSignalStore();
    const oldRing = new ScreeningKeyRing([
      { ...retainedKey, status: "active" },
    ]);
    await screenSyntheticSubmission(fixture, {
      keyRing: oldRing,
      idempotencyStore,
      duplicateStore,
      rateLimiter: allowRateLimit,
    });

    const replayAfterRotation = await screenSyntheticSubmission(fixture, {
      keyRing,
      idempotencyStore,
      duplicateStore,
      rateLimiter: allowRateLimit,
    });
    const duplicateAfterRotation = await screenSyntheticSubmission(
      { ...fixture, idempotencyKey: "synthetic-request-2" },
      {
        keyRing,
        idempotencyStore,
        duplicateStore,
        rateLimiter: allowRateLimit,
      },
    );

    expect(replayAfterRotation.flags.map(({ code }) => code)).toEqual([
      "replayed_idempotency_key",
    ]);
    expect(duplicateAfterRotation.flags.map(({ code }) => code)).toEqual([
      "duplicate_payload",
    ]);
  });

  it("exposes an explainable rate-limit flag without automatic deletion", async () => {
    const deniedRateLimit: RateLimiter = {
      async check() {
        return { allowed: false, retryAfterMs: 60_000 };
      },
    };
    const dependencies = stores();
    const result = await screenSyntheticSubmission(
      { ...fixture, idempotencyKey: "synthetic-request-2" },
      { ...dependencies, rateLimiter: deniedRateLimit },
    );

    expect(result.flags[0]?.code).toBe("rate_limited");
    expect(result.review).toEqual({ required: true, appealAvailable: true });
    expect(result.automaticallyDeleted).toBe(false);

    const acceptedAfterDeniedAttempt = await screenSyntheticSubmission(
      { ...fixture, idempotencyKey: "synthetic-request-2" },
      { ...dependencies, rateLimiter: allowRateLimit },
    );
    expect(acceptedAfterDeniedAttempt.acceptedForReview).toBe(true);
  });

  it("rejects weak or ambiguous key rings", () => {
    expect(
      () =>
        new ScreeningKeyRing([
          { id: "weak", key: Buffer.alloc(16), status: "active" },
        ]),
    ).toThrow("at least 256 bits");
    expect(
      () =>
        new ScreeningKeyRing([activeKey, { ...retainedKey, status: "active" }]),
    ).toThrow("Exactly one");
  });
});

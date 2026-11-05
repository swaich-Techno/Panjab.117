import { describe, expect, it } from "vitest";

import { CONSENT_NOTICE_DIGEST, CONSENT_NOTICE_VERSION } from "./consent";
import { ScreeningKeyRing } from "./duplicate-screening";
import {
  buildSyntheticAtomicClaim,
  createSyntheticCsrfProof,
  InMemoryAtomicIntakeStore,
  IntakeValidationError,
  validateSyntheticCsrfProof,
  validateSyntheticSubmission,
} from "./intake-readiness";
import { QUESTIONNAIRE_VERSION } from "./questionnaire";

const keyRing = new ScreeningKeyRing([
  {
    id: "synthetic-k2",
    key: Buffer.alloc(32, 2),
    status: "active",
  },
  {
    id: "synthetic-k1",
    key: Buffer.alloc(32, 1),
    status: "retained_for_duplicate_window",
  },
]);

function fixture(overrides: Record<string, unknown> = {}) {
  return {
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    locale: "en",
    idempotencyKey: "synthetic-request-0001",
    privacyScopeToken: "synthetic-scope-0001",
    withdrawalSecret: Buffer.alloc(32, 3).toString("base64url"),
    minimumAgeConfirmed: true,
    consent: {
      civicParticipation: true,
      politicalOpinion: false,
      noticeVersion: CONSENT_NOTICE_VERSION,
      noticeDigest: CONSENT_NOTICE_DIGEST,
    },
    answers: {
      assembly_segment: "54",
      healthcare_access: "good",
    },
    politicalAnswers: {},
    ...overrides,
  };
}

describe("synthetic production-intake readiness", () => {
  it("accepts a strict, versioned civic submission fixture", () => {
    const result = validateSyntheticSubmission(fixture());
    expect(result.questionnaireVersion).toBe(QUESTIONNAIRE_VERSION);
    expect(result.consent.noticeDigest).toBe(CONSENT_NOTICE_DIGEST);
    expect(result.answers.assembly_segment).toBe("54");
  });

  it("rejects malformed, unknown and out-of-range input", () => {
    expect(() =>
      validateSyntheticSubmission(
        fixture({
          contactEmail: "not-collected@example.invalid",
          idempotencyKey: "short",
          answers: {
            assembly_segment: "999",
            unknown_answer: "injected",
          },
        }),
      ),
    ).toThrow(IntakeValidationError);
  });

  it("rejects political answers when separate consent is false", () => {
    expect(() =>
      validateSyntheticSubmission(
        fixture({
          politicalAnswers: { representative_responsiveness: "good" },
        }),
      ),
    ).toThrow("requires separate political-opinion consent");
  });

  it("rejects stale consent and questionnaire versions", () => {
    expect(() =>
      validateSyntheticSubmission(
        fixture({
          questionnaireVersion: "stale-questionnaire",
          consent: {
            civicParticipation: true,
            politicalOpinion: false,
            noticeVersion: "stale-notice",
            noticeDigest: "stale-digest",
          },
        }),
      ),
    ).toThrow("unsupported");
  });

  it("validates origin-bound, signed, expiring CSRF proofs", () => {
    const key = Buffer.alloc(32, 8);
    const proof = createSyntheticCsrfProof(
      {
        keyId: "synthetic-csrf-k1",
        origin: "https://preview.example",
        cookieToken: "synthetic-csrf-token-00000000000001",
        issuedAt: "2026-11-05T00:00:00.000Z",
      },
      key,
    );

    expect(() =>
      validateSyntheticCsrfProof(proof, {
        expectedOrigin: "https://preview.example",
        syntheticHmacKey: key,
        now: new Date("2026-11-05T01:00:00.000Z"),
      }),
    ).not.toThrow();
    expect(() =>
      validateSyntheticCsrfProof(
        { ...proof, headerToken: `${proof.headerToken}x` },
        {
          expectedOrigin: "https://preview.example",
          syntheticHmacKey: key,
          now: new Date("2026-11-05T01:00:00.000Z"),
        },
      ),
    ).toThrow("token mismatch");
    expect(() =>
      validateSyntheticCsrfProof(proof, {
        expectedOrigin: "https://attacker.example",
        syntheticHmacKey: key,
        now: new Date("2026-11-05T01:00:00.000Z"),
      }),
    ).toThrow("origin mismatch");
    expect(() =>
      validateSyntheticCsrfProof(proof, {
        expectedOrigin: "https://preview.example",
        syntheticHmacKey: key,
        now: new Date("2026-11-06T00:00:00.000Z"),
      }),
    ).toThrow("expired");
  });

  it("atomically accepts one of twenty concurrent replays", async () => {
    const submission = validateSyntheticSubmission(fixture());
    const baseClaim = buildSyntheticAtomicClaim(submission, {
      responseId: "synthetic-response-0",
      keyRing,
      rateLimit: 100,
    });
    const store = new InMemoryAtomicIntakeStore();
    const outcomes = await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        store.claim({
          ...baseClaim,
          responseId: `synthetic-response-${index}`,
        }),
      ),
    );

    expect(outcomes.filter(({ status }) => status === "accepted")).toHaveLength(
      1,
    );
    expect(outcomes.filter(({ status }) => status === "replay")).toHaveLength(
      19,
    );
    expect(store.snapshot()).toMatchObject({
      idempotencySignals: 2,
      payloadSignals: 2,
      responseIds: 1,
    });
  });

  it("stores a duplicate for human review without automatic deletion", async () => {
    const store = new InMemoryAtomicIntakeStore();
    const first = validateSyntheticSubmission(fixture());
    const duplicate = validateSyntheticSubmission(
      fixture({ idempotencyKey: "synthetic-request-0002" }),
    );
    await store.claim(
      buildSyntheticAtomicClaim(first, {
        responseId: "synthetic-response-1",
        keyRing,
        rateLimit: 10,
      }),
    );
    const outcome = await store.claim(
      buildSyntheticAtomicClaim(duplicate, {
        responseId: "synthetic-response-2",
        keyRing,
        rateLimit: 10,
      }),
    );

    expect(outcome).toEqual({
      status: "duplicate",
      storedForHumanReview: true,
      acceptedForAnalysis: false,
      automaticallyDeleted: false,
    });
    expect(store.snapshot().responseIds).toBe(2);
  });

  it("commits no claims when an injected transaction failure occurs", async () => {
    let fail = true;
    const store = new InMemoryAtomicIntakeStore(() => {
      if (fail) throw new Error("synthetic commit failure");
    });
    const claim = buildSyntheticAtomicClaim(
      validateSyntheticSubmission(fixture()),
      {
        responseId: "synthetic-response-1",
        keyRing,
        rateLimit: 10,
      },
    );

    await expect(store.claim(claim)).rejects.toThrow(
      "synthetic commit failure",
    );
    expect(store.snapshot()).toEqual({
      idempotencySignals: 0,
      payloadSignals: 0,
      responseIds: 0,
      rateSignals: 0,
    });

    fail = false;
    await expect(store.claim(claim)).resolves.toMatchObject({
      status: "accepted",
    });
  });

  it("enforces the durable rate bucket before reserving claims", async () => {
    const store = new InMemoryAtomicIntakeStore();
    const first = buildSyntheticAtomicClaim(
      validateSyntheticSubmission(fixture()),
      { responseId: "synthetic-response-1", keyRing, rateLimit: 1 },
    );
    const second = buildSyntheticAtomicClaim(
      validateSyntheticSubmission(
        fixture({ idempotencyKey: "synthetic-request-0002" }),
      ),
      { responseId: "synthetic-response-2", keyRing, rateLimit: 1 },
    );

    await store.claim(first);
    const blocked = await store.claim(second);
    expect(blocked.status).toBe("rate_limited");
    expect(store.snapshot().responseIds).toBe(1);
  });
});

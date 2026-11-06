import { describe, expect, it } from "vitest";

import { InMemoryKeyProvider } from "@/lib/security/fake-key-provider";
import { aiAssistanceConfiguration } from "@/lib/ai/editorial-assistance";

import { CONSENT_NOTICE_DIGEST, CONSENT_NOTICE_VERSION } from "./consent";
import { ScreeningKeyRing } from "./duplicate-screening";
import { createSyntheticCsrfProof } from "./intake-readiness";
import { QUESTIONNAIRE_VERSION } from "./questionnaire";
import { fatehgarhSahibDraftSchedule } from "./schedule";
import {
  createPrivacySafeAuditEvent,
  InMemorySecureIntakeRepository,
  MAX_INTAKE_BODY_BYTES,
  readRawCivicAnswers,
  readRawPoliticalAnswers,
  SafeIntakeError,
  step5AIntakeConfiguration,
  submitSyntheticIntake,
} from "./secure-intake";

const now = new Date("2026-11-05T00:00:00.000Z");
const origin = "https://synthetic.local";
const csrfKey = Buffer.alloc(32, 4);
const withdrawalKey = Buffer.alloc(32, 5);

function submission(overrides: Record<string, unknown> = {}) {
  return {
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    locale: "en",
    idempotencyKey: "synthetic-request-0001",
    privacyScopeToken: "synthetic-scope-0001",
    withdrawalSecret: Buffer.alloc(32, 6).toString("base64url"),
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

function dependencies(repository = new InMemorySecureIntakeRepository()) {
  const keyProvider = new InMemoryKeyProvider();
  keyProvider.addKey("answer", 1, Buffer.alloc(32, 11));
  keyProvider.addKey("political_answer", 1, Buffer.alloc(32, 12));
  const screeningKeyRing = new ScreeningKeyRing([
    { id: "synthetic-screen-v1", key: Buffer.alloc(32, 13), status: "active" },
  ]);
  let id = 0;
  return {
    syntheticTestMode: true as const,
    agePolicyApprovedForSyntheticTest: true,
    expectedOrigin: origin,
    csrfHmacKey: csrfKey,
    withdrawalHmacKey: withdrawalKey,
    withdrawalCodeExpiresAt: "2027-01-01T00:00:00.000Z",
    keyProvider,
    screeningKeyRing,
    repository,
    rateLimit: 10,
    createResponseId: () =>
      `00000000-0000-4000-8000-${String(++id).padStart(12, "0")}`,
  };
}

function request(requestOrigin = origin) {
  return {
    origin: requestOrigin,
    now,
    csrfProof: createSyntheticCsrfProof(
      {
        keyId: "synthetic-csrf-v1",
        origin,
        cookieToken: "synthetic-csrf-token-000000000001",
        issuedAt: now.toISOString(),
      },
      csrfKey,
    ),
  };
}

describe("Step 5A secure synthetic intake", () => {
  it("keeps every live capability disabled by default", () => {
    expect(step5AIntakeConfiguration).toEqual({
      mode: "synthetic_local_only",
      liveEndpointEnabled: false,
      browserPersistenceEnabled: false,
      databaseProvisioned: false,
      aiProviderEnabled: false,
      agePolicyApproved: false,
    });
    expect(fatehgarhSahibDraftSchedule.launchApproved).toBe(false);
    expect(Object.values(fatehgarhSahibDraftSchedule.approvals)).toEqual([
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(aiAssistanceConfiguration).toMatchObject({
      enabled: false,
      permitsConfidentialResponseData: false,
    });
  });

  it("fails closed while the age policy is unapproved", async () => {
    await expect(
      submitSyntheticIntake(JSON.stringify(submission()), request(), {
        ...dependencies(),
        agePolicyApprovedForSyntheticTest: false,
      }),
    ).rejects.toMatchObject({ code: "age_policy_unapproved" });
  });

  it("rejects every call when synthetic execution is disabled", async () => {
    await expect(
      submitSyntheticIntake(JSON.stringify(submission()), request(), {
        ...dependencies(),
        syntheticTestMode: false,
      }),
    ).rejects.toMatchObject({ code: "collection_disabled" });
  });

  it("rejects malformed, oversized, stale and unauthorized-segment input", async () => {
    const deps = dependencies();
    await expect(
      submitSyntheticIntake("{", request(), deps),
    ).rejects.toBeInstanceOf(SafeIntakeError);
    await expect(
      submitSyntheticIntake(
        "x".repeat(MAX_INTAKE_BODY_BYTES + 1),
        request(),
        deps,
      ),
    ).rejects.toMatchObject({ code: "invalid_request" });
    await expect(
      submitSyntheticIntake(
        JSON.stringify(submission({ questionnaireVersion: "stale" })),
        request(),
        deps,
      ),
    ).rejects.toMatchObject({ code: "invalid_request" });
    await expect(
      submitSyntheticIntake(
        JSON.stringify(submission({ answers: { assembly_segment: "999" } })),
        request(),
        deps,
      ),
    ).rejects.toMatchObject({ code: "invalid_request" });
  });

  it("rejects cross-origin and forged-CSRF requests with a safe error", async () => {
    await expect(
      submitSyntheticIntake(
        JSON.stringify(submission()),
        request("https://attacker.example"),
        dependencies(),
      ),
    ).rejects.toMatchObject({ code: "request_not_trusted" });
    const forged = request();
    forged.csrfProof.signature = `${forged.csrfProof.signature}x`;
    await expect(
      submitSyntheticIntake(
        JSON.stringify(submission()),
        forged,
        dependencies(),
      ),
    ).rejects.toMatchObject({ code: "request_not_trusted" });
  });

  it("atomically stores one concurrent request and treats the rest as replays", async () => {
    const deps = { ...dependencies(), rateLimit: 100 };
    const receipts = await Promise.all(
      Array.from({ length: 12 }, () =>
        submitSyntheticIntake(JSON.stringify(submission()), request(), deps),
      ),
    );
    expect(receipts.filter(({ status }) => status === "accepted")).toHaveLength(
      1,
    );
    expect(receipts.filter(({ status }) => status === "replay")).toHaveLength(
      11,
    );
    expect(deps.repository.snapshot().records).toBe(1);
  });

  it("recovers a lost receipt only when the retry proves the original secret", async () => {
    const deps = dependencies();
    const raw = JSON.stringify(submission());
    const accepted = await submitSyntheticIntake(raw, request(), deps);

    const recovered = await submitSyntheticIntake(raw, request(), deps);
    expect(recovered).toMatchObject({
      status: "replay",
      responseId: accepted.responseId,
      withdrawalCode: submission().withdrawalSecret,
      receiptRecoveryVerified: true,
    });

    const hostileRetry = submission({
      withdrawalSecret: Buffer.alloc(32, 99).toString("base64url"),
    });
    const rejectedRecovery = await submitSyntheticIntake(
      JSON.stringify(hostileRetry),
      request(),
      deps,
    );
    expect(rejectedRecovery).toMatchObject({
      status: "replay",
      responseId: null,
      withdrawalCode: null,
      receiptRecoveryVerified: false,
    });
    expect(deps.repository.snapshot().records).toBe(1);
  });

  it("stores identical answers for review instead of asserting one person", async () => {
    const deps = dependencies();
    await submitSyntheticIntake(JSON.stringify(submission()), request(), deps);
    const second = await submitSyntheticIntake(
      JSON.stringify(submission({ idempotencyKey: "synthetic-request-0002" })),
      request(),
      deps,
    );
    expect(second).toMatchObject({
      status: "duplicate",
      storedForHumanReview: true,
      acceptedForAnalysis: false,
      automaticallyDeleted: false,
    });
    expect(deps.repository.get(second.responseId!)?.qualityStatus).toBe(
      "pending_duplicate_review",
    );
  });

  it("rolls back the response and claims when storage fails", async () => {
    const repository = new InMemorySecureIntakeRepository(() => {
      throw new Error("synthetic transaction failure");
    });
    const deps = dependencies(repository);
    await expect(
      submitSyntheticIntake(JSON.stringify(submission()), request(), deps),
    ).rejects.toMatchObject({ code: "service_unavailable" });
    expect(repository.snapshot()).toMatchObject({
      records: 0,
      activePayloads: 0,
    });
  });

  it("rate-limits a privacy scope without storing the rejected payload", async () => {
    const deps = { ...dependencies(), rateLimit: 1 };
    await submitSyntheticIntake(JSON.stringify(submission()), request(), deps);
    const blocked = await submitSyntheticIntake(
      JSON.stringify(submission({ idempotencyKey: "synthetic-request-0002" })),
      request(),
      deps,
    );
    expect(blocked.status).toBe("rate_limited");
    expect(deps.repository.snapshot().records).toBe(1);
  });

  it("encrypts civic and political answers separately and enforces MFA/RBAC", async () => {
    const deps = dependencies();
    const receipt = await submitSyntheticIntake(
      JSON.stringify(
        submission({
          consent: {
            civicParticipation: true,
            politicalOpinion: true,
            noticeVersion: CONSENT_NOTICE_VERSION,
            noticeDigest: CONSENT_NOTICE_DIGEST,
          },
          politicalAnswers: { representative_responsiveness: "good" },
        }),
      ),
      request(),
      deps,
    );
    const record = deps.repository.get(receipt.responseId!)!;
    expect(record.civic?.wrappedKey.purpose).toBe("answer");
    expect(record.political?.wrappedKey.purpose).toBe("political_answer");
    expect(() =>
      readRawPoliticalAnswers(
        record,
        {
          role: "raw_civic_reviewer",
          authenticated: true,
          mfaVerified: true,
          purpose: "approved quality review",
          approvalId: "approval-1234",
        },
        deps.keyProvider,
      ),
    ).toThrow("Access denied");
    expect(
      readRawCivicAnswers(
        record,
        {
          role: "raw_civic_reviewer",
          authenticated: true,
          mfaVerified: true,
          purpose: "approved quality review",
          approvalId: "approval-1234",
        },
        deps.keyProvider,
      ),
    ).toMatchObject({ assembly_segment: "54" });
    expect(() =>
      readRawCivicAnswers(
        record,
        {
          role: "raw_civic_reviewer",
          authenticated: true,
          mfaVerified: false,
          purpose: "approved quality review",
          approvalId: "approval-1234",
        },
        deps.keyProvider,
      ),
    ).toThrow("Access denied");
  });

  it("keeps old wrapped keys readable during a synthetic key rotation", async () => {
    const deps = dependencies();
    const receipt = await submitSyntheticIntake(
      JSON.stringify(submission()),
      request(),
      deps,
    );
    deps.keyProvider.addKey("answer", 2, Buffer.alloc(32, 21));
    const record = deps.repository.get(receipt.responseId!)!;
    expect(
      readRawCivicAnswers(
        record,
        {
          role: "raw_civic_reviewer",
          authenticated: true,
          mfaVerified: true,
          purpose: "approved key rotation check",
          approvalId: "approval-5678",
        },
        deps.keyProvider,
      ),
    ).toMatchObject({ healthcare_access: "good" });
  });

  it("creates answer-free audit metadata", () => {
    const event = createPrivacySafeAuditEvent({
      action: "raw_civic_read",
      actorRole: "raw_civic_reviewer",
      responseId: "synthetic-response-id",
      occurredAt: now.toISOString(),
      outcome: "allowed",
    });
    expect(JSON.stringify(event)).not.toContain("healthcare_access");
    expect(event).not.toHaveProperty("answers");
  });
});

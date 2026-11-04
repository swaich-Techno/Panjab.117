import { describe, expect, it } from "vitest";

import { InMemoryKeyProvider } from "@/lib/security/fake-key-provider";

import { CONSENT_NOTICE_DIGEST, CONSENT_NOTICE_VERSION } from "./consent";
import { ScreeningKeyRing } from "./duplicate-screening";
import {
  createIntakeHttpHandler,
  createProductionIntakeGate,
  type IntakeTransportRequest,
  type SafeTransportAuditEvent,
} from "./intake-http-service";
import { createSyntheticCsrfProof } from "./intake-readiness";
import { QUESTIONNAIRE_VERSION } from "./questionnaire";
import {
  InMemorySecureIntakeRepository,
  submitSyntheticIntake,
} from "./secure-intake";

const origin = "https://survey.synthetic.local";
const now = new Date("2026-11-05T00:00:00.000Z");
const csrfKey = Buffer.alloc(32, 41);
const csrfToken = "synthetic-csrf-token-000000000001";

function submission(segment = "54", locale = "en") {
  return {
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    locale,
    idempotencyKey: `synthetic-request-${segment}-${locale}-0001`,
    privacyScopeToken: `synthetic-scope-${segment}-${locale}-0001`,
    minimumAgeConfirmed: true,
    consent: {
      civicParticipation: true,
      politicalOpinion: false,
      noticeVersion: CONSENT_NOTICE_VERSION,
      noticeDigest: CONSENT_NOTICE_DIGEST,
    },
    answers: { assembly_segment: segment, healthcare_access: "good" },
    politicalAnswers: {},
  };
}

function request(body = JSON.stringify(submission())): IntakeTransportRequest {
  const proof = createSyntheticCsrfProof(
    {
      keyId: "synthetic-csrf-v1",
      origin,
      cookieToken: csrfToken,
      issuedAt: now.toISOString(),
    },
    csrfKey,
  );
  return {
    method: "POST",
    protocol: "https:",
    origin,
    contentType: "application/json; charset=utf-8",
    contentLength: String(Buffer.byteLength(body)),
    secFetchSite: "same-origin",
    csrfCookieToken: csrfToken,
    headers: {
      "x-p117-csrf-key-id": proof.keyId,
      "x-p117-csrf-token": proof.headerToken,
      "x-p117-csrf-issued-at": proof.issuedAt,
      "x-p117-csrf-signature": proof.signature,
    },
    body,
    receivedAt: now,
    correlationId: "synthetic-correlation-0001",
  };
}

function harness() {
  const repository = new InMemorySecureIntakeRepository();
  const keyProvider = new InMemoryKeyProvider();
  keyProvider.addKey("answer", 1, Buffer.alloc(32, 42));
  keyProvider.addKey("political_answer", 1, Buffer.alloc(32, 43));
  const screeningKeyRing = new ScreeningKeyRing([
    { id: "synthetic-screen-v1", key: Buffer.alloc(32, 44), status: "active" },
  ]);
  const audit: SafeTransportAuditEvent[] = [];
  let sequence = 0;
  const handler = createIntakeHttpHandler({
    expectedOrigin: origin,
    audit: (event) => audit.push(event),
    submit: (body, intakeRequest) =>
      submitSyntheticIntake(body, intakeRequest, {
        syntheticTestMode: true,
        agePolicyApprovedForSyntheticTest: true,
        expectedOrigin: origin,
        csrfHmacKey: csrfKey,
        withdrawalHmacKey: Buffer.alloc(32, 45),
        withdrawalCodeExpiresAt: "2027-01-01T00:00:00.000Z",
        keyProvider,
        screeningKeyRing,
        repository,
        rateLimit: 100,
        createResponseId: () =>
          `00000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}`,
      }),
  });
  return { handler, repository, audit };
}

describe("Step 5C intake HTTP boundary", () => {
  it("accepts all nine scoped segments and all three locales synthetically", async () => {
    const segments = ["54", "55", "56", "57", "58", "59", "67", "69", "106"];
    for (const locale of ["en", "pa", "hi"]) {
      for (const segment of segments) {
        const { handler } = harness();
        const result = await handler(
          request(JSON.stringify(submission(segment, locale))),
        );
        expect(result.status).toBe(201);
        expect(result.headers["cache-control"]).toContain("no-store");
      }
    }
  });

  it("rejects insecure transport, cross-origin, forged CSRF and oversized input", async () => {
    const { handler } = harness();
    await expect(
      handler({ ...request(), protocol: "http:" }),
    ).resolves.toMatchObject({
      status: 400,
    });
    await expect(
      handler({ ...request(), origin: "https://attacker.example" }),
    ).resolves.toMatchObject({ status: 403 });
    await expect(
      handler({
        ...request(),
        csrfCookieToken: "forged-token-000000000000000000000000",
      }),
    ).resolves.toMatchObject({ status: 403 });
    const oversized = "x".repeat(32 * 1024 + 1);
    await expect(handler(request(oversized))).resolves.toMatchObject({
      status: 413,
    });
  });

  it("allows only the exact credentialed CORS preflight", async () => {
    const { handler } = harness();
    const valid = await handler({
      ...request(""),
      method: "OPTIONS",
      secFetchSite: "same-site",
      headers: {
        "access-control-request-method": "POST",
        "access-control-request-headers":
          "content-type, x-p117-csrf-key-id, x-p117-csrf-token, x-p117-csrf-issued-at, x-p117-csrf-signature",
      },
    });
    expect(valid).toMatchObject({ status: 204, body: "" });
    expect(valid.headers["access-control-allow-origin"]).toBe(origin);
    await expect(
      handler({
        ...request(""),
        method: "OPTIONS",
        headers: {
          "access-control-request-method": "DELETE",
          "access-control-request-headers": "authorization",
        },
      }),
    ).resolves.toMatchObject({ status: 403 });
  });

  it("rejects SQL/XSS-shaped values and never puts confidential data in audit events", async () => {
    const { handler, audit } = harness();
    const malicious = submission("54");
    malicious.answers.healthcare_access = "<script>alert(1)</script>' OR 1=1";
    const result = await handler(request(JSON.stringify(malicious)));
    expect(result.status).toBe(400);
    expect(JSON.stringify(audit)).not.toContain("healthcare_access");
    expect(JSON.stringify(audit)).not.toContain("script");
  });

  it("keeps the production gate closed before consulting submission storage", async () => {
    let submitted = false;
    const handler = createProductionIntakeGate({
      expectedOrigin: origin,
      deploymentCommitSha: "a".repeat(40),
      deploymentImageDigest: `sha256:${"b".repeat(64)}`,
      evidenceProvider: { readVerifiedEvidence: async () => null },
      submitApproved: async () => {
        submitted = true;
        throw new Error("must not run");
      },
      audit: () => undefined,
    });
    const result = await handler(request());
    expect(result.status).toBe(503);
    expect(submitted).toBe(false);
  });

  it("still rejects when booleans are true but signed approval evidence is absent", async () => {
    let submitted = false;
    const handler = createProductionIntakeGate({
      expectedOrigin: origin,
      deploymentCommitSha: "a".repeat(40),
      deploymentImageDigest: `sha256:${"b".repeat(64)}`,
      evidenceProvider: { readVerifiedEvidence: async () => null },
      controls: {
        liveSurveyCollectionEnabled: true,
        launchApproved: true,
        operationalApprovals: {
          production_security: true,
          privacy: true,
          consent: true,
          backup_and_recovery: true,
          operations: true,
        },
      },
      submitApproved: async () => {
        submitted = true;
        throw new Error("must not run");
      },
      audit: () => undefined,
    });
    await expect(handler(request())).resolves.toMatchObject({ status: 503 });
    expect(submitted).toBe(false);
  });

  it("refuses a non-canonical or non-HTTPS configured Origin", () => {
    expect(() =>
      createIntakeHttpHandler({
        expectedOrigin: "http://survey.example",
        audit: () => undefined,
        submit: async () => {
          throw new Error("must not run");
        },
      }),
    ).toThrow("canonical HTTPS origin");
  });
});

import { describe, expect, it } from "vitest";

import { readRawCivicAnswers } from "@/lib/survey/secure-intake";
import {
  CONSENT_NOTICE_DIGEST,
  CONSENT_NOTICE_VERSION,
} from "@/lib/survey/consent";
import { QUESTIONNAIRE_VERSION } from "@/lib/survey/questionnaire";

import { LocalSyntheticStagingRuntime } from "./local-synthetic-runtime";

function syntheticBody(input: {
  id: string;
  withdrawalByte: number;
  segment?: string;
  consentVersion?: string;
  withdrawalSecret?: string;
}): string {
  return JSON.stringify({
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    locale: "en",
    idempotencyKey: `step5e-idempotency-${input.id}`,
    privacyScopeToken: `step5e-privacy-scope-${input.id}`,
    withdrawalSecret:
      input.withdrawalSecret ??
      Buffer.alloc(32, input.withdrawalByte).toString("base64url"),
    minimumAgeConfirmed: true,
    consent: {
      civicParticipation: true,
      politicalOpinion: true,
      noticeVersion: input.consentVersion ?? CONSENT_NOTICE_VERSION,
      noticeDigest: CONSENT_NOTICE_DIGEST,
    },
    answers: {
      assembly_segment: input.segment ?? "55",
      healthcare_access: "good",
    },
    politicalAnswers: {
      representative_responsiveness: "fair",
    },
  });
}

describe("Step 5E complete synthetic staging workflow", () => {
  it("submits, recovers, audits, backs up, withdraws and suppresses restore", async () => {
    const runtime = new LocalSyntheticStagingRuntime();
    const now = new Date("2026-11-05T12:00:00.000Z");
    runtime.start();

    const body = syntheticBody({ id: "journey-0001", withdrawalByte: 71 });
    const accepted = await runtime.submitBody(body, now);
    expect(accepted.status).toBe(201);
    const receipt = JSON.parse(accepted.body) as {
      responseId: string;
      withdrawalCode: string;
    };
    expect(receipt.responseId).toMatch(/^[a-f0-9-]{36}$/u);
    expect(receipt.withdrawalCode).toMatch(/^[A-Za-z0-9_-]{32,}$/u);

    const stored = runtime.getRecord(receipt.responseId)!;
    expect(JSON.stringify(stored)).not.toContain("healthcare_access");
    expect(stored.civic?.wrappedKey.purpose).toBe("answer");
    expect(stored.political?.wrappedKey.purpose).toBe("political_answer");

    const replay = await runtime.submitBody(
      body,
      new Date(now.getTime() + 1_000),
    );
    expect(replay.status).toBe(200);
    expect(JSON.parse(replay.body)).toMatchObject({
      status: "replay",
      responseId: receipt.responseId,
      withdrawalCode: receipt.withdrawalCode,
      receiptRecoveryVerified: true,
    });
    const unverifiedReplay = await runtime.submitBody(
      syntheticBody({
        id: "journey-0001",
        withdrawalByte: 71,
        withdrawalSecret: Buffer.alloc(32, 72).toString("base64url"),
      }),
      new Date(now.getTime() + 2_000),
    );
    expect(unverifiedReplay.status).toBe(409);
    expect(JSON.parse(unverifiedReplay.body)).toMatchObject({
      responseId: null,
      withdrawalCode: null,
      receiptRecoveryVerified: false,
    });

    const firstOutboxRun = await runtime.processOutbox(
      new Date(now.getTime() + 3_000),
      "step5e-worker-first",
    );
    expect(firstOutboxRun.delivered).toBe(1);
    expect(
      await runtime.processOutbox(
        new Date(now.getTime() + 4_000),
        "step5e-worker-restarted",
      ),
    ).toEqual({ delivered: 0, failed: 0, deadLettered: 0 });

    expect(() =>
      readRawCivicAnswers(
        stored,
        {
          role: "survey_analyst",
          authenticated: true,
          mfaVerified: true,
          purpose: "unauthorized synthetic review",
          approvalId: "step5e-denied-review",
        },
        runtime.keys,
      ),
    ).toThrow("Access denied");
  });

  it("executes withdrawal and deletion-ledger replay in restore quarantine", async () => {
    const runtime = new LocalSyntheticStagingRuntime();
    const now = new Date("2026-11-05T13:00:00.000Z");
    runtime.start();
    const accepted = await runtime.submitBody(
      syntheticBody({ id: "withdrawal-0001", withdrawalByte: 73 }),
      now,
    );
    const receipt = JSON.parse(accepted.body) as {
      responseId: string;
      withdrawalCode: string;
    };
    const backup = runtime.createBackup(receipt.responseId, now.toISOString());
    const outcome = runtime.withdraw(
      receipt.responseId,
      receipt.withdrawalCode,
      "2026-11-05T13:05:00.000Z",
    );
    expect(outcome.status).toBe("verified_and_deleted");
    expect(runtime.getRecord(receipt.responseId)).toMatchObject({
      civic: null,
      political: null,
      withdrawalState: "live_data_deleted",
    });
    expect(runtime.restoreToQuarantine(backup, [])).toEqual({
      responseId: receipt.responseId,
      state: "suppressed_by_deletion_ledger",
      releaseAllowed: false,
    });
  });

  it("handles concurrent synthetic submissions without response loss", async () => {
    const runtime = new LocalSyntheticStagingRuntime();
    runtime.start();
    const now = new Date("2026-11-05T14:00:00.000Z");
    const responses = await Promise.all(
      [74, 75, 76, 77, 78].map((withdrawalByte, index) =>
        runtime.submitBody(
          syntheticBody({
            id: `concurrent-${index}`,
            withdrawalByte,
            segment: ["54", "55", "56", "57", "58"][index],
          }),
          new Date(now.getTime() + index),
        ),
      ),
    );
    expect(responses.every(({ status }) => [201, 202].includes(status))).toBe(
      true,
    );
    const responseIds = responses.map(
      ({ body }) => (JSON.parse(body) as { responseId: string }).responseId,
    );
    expect(new Set(responseIds).size).toBe(5);
    expect(runtime.outboxSnapshot()).toHaveLength(5);
  });

  it("fails closed for transport, consent, dependency and shutdown failures", async () => {
    const runtime = new LocalSyntheticStagingRuntime();
    const now = new Date("2026-11-05T15:00:00.000Z");
    const body = syntheticBody({ id: "failure-0001", withdrawalByte: 79 });
    runtime.start();

    expect(
      (await runtime.submitBody(body, now, { protocol: "http:" })).status,
    ).toBe(400);
    expect(
      (
        await runtime.submitBody(body, now, {
          origin: "https://untrusted.invalid",
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await runtime.submitBody(body, now, {
          csrfIssuedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await runtime.submitBody(body, now, {
          csrfSignature: Buffer.alloc(32, 1).toString("base64url"),
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await runtime.submitBody(
          syntheticBody({
            id: "bad-consent-0001",
            withdrawalByte: 80,
            consentVersion: "expired-consent-version",
          }),
          now,
        )
      ).status,
    ).toBe(400);

    runtime.setDatabaseAvailable(false);
    expect((await runtime.submitBody(body, now)).status).toBe(503);
    runtime.setDatabaseAvailable(true);
    runtime.secrets.setAvailable(false);
    expect((await runtime.submitBody(body, now)).status).toBe(503);
    runtime.secrets.setAvailable(true);
    runtime.keys.removeKey("answer", 1);
    expect((await runtime.submitBody(body, now)).status).toBe(503);
    runtime.keys.addKey("answer", 1);
    runtime.stop();
    expect((await runtime.submitBody(body, now)).status).toBe(503);

    const publicBodies = runtime.edgeAuditEvents.map((event) =>
      JSON.stringify(event),
    );
    expect(publicBodies.join("\n")).not.toMatch(
      /healthcare_access|representative_responsiveness|withdrawalSecret/u,
    );
    expect(runtime.emergencyController.isEnabled()).toBe(false);
  });
});

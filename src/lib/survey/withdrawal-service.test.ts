import { describe, expect, it } from "vitest";

import { InMemoryKeyProvider } from "@/lib/security/fake-key-provider";

import { CONSENT_NOTICE_DIGEST, CONSENT_NOTICE_VERSION } from "./consent";
import { ScreeningKeyRing } from "./duplicate-screening";
import { createSyntheticCsrfProof } from "./intake-readiness";
import { QUESTIONNAIRE_VERSION } from "./questionnaire";
import {
  InMemorySecureIntakeRepository,
  readRawCivicAnswers,
  submitSyntheticIntake,
} from "./secure-intake";
import { processSyntheticWithdrawal } from "./withdrawal-service";

const checkedAt = "2026-11-06T00:00:00.000Z";

async function storedFixture() {
  const repository = new InMemorySecureIntakeRepository();
  const keyProvider = new InMemoryKeyProvider();
  keyProvider.addKey("answer", 1, Buffer.alloc(32, 31));
  keyProvider.addKey("political_answer", 1, Buffer.alloc(32, 32));
  const csrfKey = Buffer.alloc(32, 33);
  const withdrawalKey = Buffer.alloc(32, 34);
  const now = new Date("2026-11-05T00:00:00.000Z");
  const origin = "https://synthetic.local";
  const receipt = await submitSyntheticIntake(
    JSON.stringify({
      questionnaireVersion: QUESTIONNAIRE_VERSION,
      locale: "en",
      idempotencyKey: "synthetic-request-0001",
      privacyScopeToken: "synthetic-scope-0001",
      withdrawalSecret: Buffer.alloc(32, 36).toString("base64url"),
      minimumAgeConfirmed: true,
      consent: {
        civicParticipation: true,
        politicalOpinion: true,
        noticeVersion: CONSENT_NOTICE_VERSION,
        noticeDigest: CONSENT_NOTICE_DIGEST,
      },
      answers: { assembly_segment: "55" },
      politicalAnswers: { representative_responsiveness: "good" },
    }),
    {
      origin,
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
    },
    {
      syntheticTestMode: true,
      agePolicyApprovedForSyntheticTest: true,
      expectedOrigin: origin,
      csrfHmacKey: csrfKey,
      withdrawalHmacKey: withdrawalKey,
      withdrawalCodeExpiresAt: "2027-01-01T00:00:00.000Z",
      keyProvider,
      screeningKeyRing: new ScreeningKeyRing([
        { id: "screen-v1", key: Buffer.alloc(32, 35), status: "active" },
      ]),
      repository,
      rateLimit: 5,
      createResponseId: () => "00000000-0000-4000-8000-000000000001",
    },
  );
  return { repository, keyProvider, withdrawalKey, receipt };
}

describe("synthetic withdrawal and backup suppression", () => {
  it("deletes both live partitions and emits backup suppression entries", async () => {
    const fixture = await storedFixture();
    const record = fixture.repository.get(fixture.receipt.responseId!)!;
    const outcome = processSyntheticWithdrawal(
      record,
      fixture.receipt.withdrawalCode!,
      checkedAt,
      fixture.withdrawalKey,
      fixture.repository,
    );
    expect(outcome).toMatchObject({
      status: "verified_and_deleted",
      responseId: fixture.receipt.responseId,
    });
    expect(outcome.deletionLedger.map(({ action }) => action)).toEqual([
      "destroy_answer_key",
      "destroy_political_answer_key",
    ]);
    expect(fixture.repository.get(fixture.receipt.responseId!)).toMatchObject({
      withdrawalState: "live_data_deleted",
      civic: null,
      political: null,
    });
  });

  it("rejects token reuse and raw access after deletion", async () => {
    const fixture = await storedFixture();
    const before = fixture.repository.get(fixture.receipt.responseId!)!;
    processSyntheticWithdrawal(
      before,
      fixture.receipt.withdrawalCode!,
      checkedAt,
      fixture.withdrawalKey,
      fixture.repository,
    );
    expect(
      processSyntheticWithdrawal(
        before,
        fixture.receipt.withdrawalCode!,
        checkedAt,
        fixture.withdrawalKey,
        fixture.repository,
      ).status,
    ).toBe("already_redeemed");
    expect(() =>
      readRawCivicAnswers(
        fixture.repository.get(fixture.receipt.responseId!)!,
        {
          role: "raw_civic_reviewer",
          authenticated: true,
          mfaVerified: true,
          purpose: "approved privacy verification",
          approvalId: "approval-9012",
        },
        fixture.keyProvider,
      ),
    ).toThrow("Access denied");
  });

  it("locks a withdrawal receipt after repeated invalid attempts", async () => {
    const fixture = await storedFixture();
    let record = fixture.repository.get(fixture.receipt.responseId!)!;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      processSyntheticWithdrawal(
        record,
        `invalid-code-${attempt}`,
        checkedAt,
        fixture.withdrawalKey,
        fixture.repository,
      );
      record = fixture.repository.get(fixture.receipt.responseId!)!;
    }
    const final = processSyntheticWithdrawal(
      record,
      "invalid-code-final",
      checkedAt,
      fixture.withdrawalKey,
      fixture.repository,
    );
    expect(final.status).toBe("locked");
    expect(fixture.repository.snapshot().activePayloads).toBe(1);
  });
});

import { describe, expect, it } from "vitest";

import {
  createEncryptedBackup,
  mustSuppressRestoredResponse,
  restoreEncryptedBackup,
} from "@/lib/security/backup";
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

describe("Step 5C synthetic end-to-end journey", () => {
  it("encrypts, receipts, backs up, withdraws and suppresses a restored response", async () => {
    const now = new Date("2026-11-05T00:00:00.000Z");
    const origin = "https://survey.synthetic.local";
    const csrfKey = Buffer.alloc(32, 51);
    const withdrawalKey = Buffer.alloc(32, 52);
    const provider = new InMemoryKeyProvider();
    provider.addKey("answer", 1, Buffer.alloc(32, 53));
    provider.addKey("political_answer", 1, Buffer.alloc(32, 54));
    provider.addKey("backup", 1, Buffer.alloc(32, 55));
    const repository = new InMemorySecureIntakeRepository();
    const body = JSON.stringify({
      questionnaireVersion: QUESTIONNAIRE_VERSION,
      locale: "en",
      idempotencyKey: "synthetic-e2e-request-0001",
      privacyScopeToken: "synthetic-e2e-scope-0001",
      withdrawalSecret: Buffer.alloc(32, 57).toString("base64url"),
      minimumAgeConfirmed: true,
      consent: {
        civicParticipation: true,
        politicalOpinion: true,
        noticeVersion: CONSENT_NOTICE_VERSION,
        noticeDigest: CONSENT_NOTICE_DIGEST,
      },
      answers: {
        assembly_segment: "55",
        healthcare_access: "good",
      },
      politicalAnswers: {
        representative_responsiveness: "fair",
      },
    });
    const receipt = await submitSyntheticIntake(
      body,
      {
        origin,
        now,
        csrfProof: createSyntheticCsrfProof(
          {
            keyId: "synthetic-csrf-v1",
            origin,
            cookieToken: "synthetic-e2e-csrf-token-00000001",
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
        keyProvider: provider,
        screeningKeyRing: new ScreeningKeyRing([
          {
            id: "synthetic-screen-v1",
            key: Buffer.alloc(32, 56),
            status: "active",
          },
        ]),
        repository,
        rateLimit: 10,
        createResponseId: () => "00000000-0000-4000-8000-000000000501",
      },
    );
    expect(receipt.status).toBe("accepted");
    expect(receipt.withdrawalCode).toMatch(/^[A-Za-z0-9_-]{32,}$/u);
    const record = repository.get(receipt.responseId!);
    expect(record?.civic?.envelope.ciphertext).not.toContain("healthcare");
    expect(record?.political?.wrappedKey.purpose).toBe("political_answer");
    expect(
      readRawCivicAnswers(
        record!,
        {
          role: "raw_civic_reviewer",
          authenticated: true,
          mfaVerified: true,
          purpose: "synthetic verification",
          approvalId: "synthetic-review-0001",
        },
        provider,
      ),
    ).toMatchObject({ healthcare_access: "good" });

    const logicalDump = Buffer.from(JSON.stringify(record), "utf8");
    const backup = createEncryptedBackup(
      logicalDump,
      {
        backupId: "synthetic-step5c-backup-0001",
        createdAt: now.toISOString(),
        schemaVersion: "0003_step_5b_verification_hardening",
        databaseVersion: "MySQL 8.4 synthetic evidence",
        deletionLedger: [],
      },
      provider,
    );
    expect(restoreEncryptedBackup(backup, [], provider)).toEqual(logicalDump);

    const withdrawal = processSyntheticWithdrawal(
      record!,
      receipt.withdrawalCode!,
      "2026-11-06T00:00:00.000Z",
      withdrawalKey,
      repository,
    );
    expect(withdrawal.status).toBe("verified_and_deleted");
    expect(repository.get(record!.responseId)).toMatchObject({
      civic: null,
      political: null,
      withdrawalState: "live_data_deleted",
    });
    expect(
      mustSuppressRestoredResponse(
        record!.responseId,
        withdrawal.deletionLedger,
      ),
    ).toBe(true);
  });
});

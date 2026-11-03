import { randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import { locales } from "@/lib/i18n";

import {
  consentNotice,
  CONSENT_NOTICE_VERSION,
  createSyntheticConsentRecord,
  createSyntheticWithdrawalCase,
  getConsentNotice,
  transitionWithdrawalCase,
} from "./consent";
import { QUESTIONNAIRE_VERSION } from "./questionnaire";

describe("consent and withdrawal design", () => {
  it("provides complete localized notices marked for human review", () => {
    expect(consentNotice.translationStatus).toBe(
      "human_linguistic_and_legal_review_required",
    );

    for (const locale of locales) {
      const notice = getConsentNotice(locale);
      expect(notice.title.length).toBeGreaterThan(10);
      expect(notice.voluntary.length).toBeGreaterThan(80);
      expect(notice.politicalConsentLabel.length).toBeGreaterThan(30);
      expect(notice.privacyContact).toMatch(/launch|ਲਾਂਚ|लॉन्च/);
    }
  });

  it("tracks exact questionnaire and consent versions separately", () => {
    const record = createSyntheticConsentRecord({
      locale: "pa",
      politicalOpinion: false,
      recordedAt: "2026-11-03T12:00:00.000Z",
    });

    expect(record.questionnaireVersion).toBe(QUESTIONNAIRE_VERSION);
    expect(record.noticeVersion).toBe(CONSENT_NOTICE_VERSION);
    expect(record.politicalOpinion).toBe(false);
    expect(record.status).toBe("synthetic_preview_only");
  });

  it("never retains a raw withdrawal locator", () => {
    const locator = "synthetic-withdrawal-code";
    const withdrawalCase = createSyntheticWithdrawalCase(
      {
        caseId: "case-synthetic-1",
        mode: "anonymous_withdrawal_code",
        locator,
        receivedAt: "2026-11-03T12:00:00.000Z",
      },
      randomBytes(32),
    );

    expect(JSON.stringify(withdrawalCase)).not.toContain(locator);
    expect(withdrawalCase.locatorDigest.length).toBeGreaterThan(30);
  });

  it("requires verified deletion and backup-ledger steps before completion", () => {
    const key = Buffer.alloc(32, 7);
    let withdrawalCase = createSyntheticWithdrawalCase(
      {
        caseId: "case-synthetic-2",
        mode: "verified_optional_contact",
        locator: "synthetic-contact-token",
        receivedAt: "2026-11-03T12:00:00.000Z",
      },
      key,
    );

    const sequence = [
      "verification_pending",
      "verified",
      "approved",
      "live_data_deleted",
      "backup_ledger_recorded",
      "completed",
    ] as const;

    for (const [index, state] of sequence.entries()) {
      withdrawalCase = transitionWithdrawalCase(
        withdrawalCase,
        state,
        `2026-11-03T12:0${index + 1}:00.000Z`,
      );
    }

    expect(withdrawalCase.state).toBe("completed");
    expect(withdrawalCase.history.map(({ state }) => state)).toEqual([
      "received",
      ...sequence,
    ]);
  });

  it("fails closed on an invalid workflow shortcut", () => {
    const withdrawalCase = createSyntheticWithdrawalCase(
      {
        caseId: "case-synthetic-3",
        mode: "anonymous_withdrawal_code",
        locator: "synthetic-code",
        receivedAt: "2026-11-03T12:00:00.000Z",
      },
      Buffer.alloc(32, 9),
    );

    expect(() =>
      transitionWithdrawalCase(
        withdrawalCase,
        "completed",
        "2026-11-03T12:01:00.000Z",
      ),
    ).toThrow("Invalid withdrawal transition");
  });
});

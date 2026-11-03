import { describe, expect, it } from "vitest";

import { locales } from "@/lib/i18n";

import {
  fatehgarhSahibQuestionnaire,
  getQuestionnaireQuestions,
  QUESTIONNAIRE_VERSION,
} from "./questionnaire";

describe("versioned Fatehgarh Sahib questionnaire", () => {
  it("contains the exact nine official Assembly segments", () => {
    const segmentQuestion = fatehgarhSahibQuestionnaire.questions.find(
      ({ id }) => id === "assembly_segment",
    );

    expect(segmentQuestion?.options.map(({ id }) => Number(id))).toEqual([
      54, 55, 56, 57, 58, 59, 67, 69, 106,
    ]);
    expect(
      segmentQuestion?.options.every(({ label }) =>
        /\p{Script=Gurmukhi}/u.test(label.pa),
      ),
    ).toBe(true);
    expect(
      segmentQuestion?.options.every(({ label }) =>
        /\p{Script=Devanagari}/u.test(label.hi),
      ),
    ).toBe(true);
  });

  it("is versioned and explicitly development-only", () => {
    expect(QUESTIONNAIRE_VERSION).toContain("draft-1");
    expect(fatehgarhSahibQuestionnaire.status).toBe("development_preview_only");
    expect(fatehgarhSahibQuestionnaire.translationStatus).toBe(
      "human_linguistic_and_legal_review_required",
    );
  });

  it("provides every prompt and option in all three languages", () => {
    for (const question of fatehgarhSahibQuestionnaire.questions) {
      for (const locale of locales) {
        expect(question.prompt[locale].trim().length).toBeGreaterThan(8);
        const helpText =
          "helpText" in question ? question.helpText[locale] : undefined;
        expect(helpText?.trim().length ?? 9).toBeGreaterThan(8);
        for (const option of question.options) {
          expect(option.label[locale].trim()).not.toBe("");
        }
      }
    }
  });

  it("keeps political-opinion questions optional and separately filterable", () => {
    const political = fatehgarhSahibQuestionnaire.questions.filter(
      ({ politicalOpinion }) => politicalOpinion,
    );

    expect(political.length).toBeGreaterThan(0);
    expect(political.every(({ required }) => !required)).toBe(true);
    expect(getQuestionnaireQuestions(false)).not.toContainEqual(
      expect.objectContaining({ politicalOpinion: true }),
    );
  });
});

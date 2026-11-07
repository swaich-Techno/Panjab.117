import { describe, expect, it } from "vitest";

import { regions } from "../data/constituencies";

import { locales } from "./i18n";
import { regionalDictionaries } from "./regional-translations";

describe("regional translations", () => {
  it.each(locales)("provides complete regional labels for %s", (locale) => {
    const dictionary = regionalDictionaries[locale];
    expect(Object.keys(dictionary.regions).sort()).toEqual([...regions].sort());
    expect(dictionary.classificationNotice.length).toBeGreaterThan(40);
    expect(dictionary.noIntake.length).toBeGreaterThan(40);
  });

  it("uses native Unicode scripts for Punjabi and Hindi", () => {
    expect(regionalDictionaries.pa.regions.majha.name).toMatch(
      /[\u0A00-\u0A7F]/u,
    );
    expect(regionalDictionaries.hi.regions.majha.name).toMatch(
      /[\u0900-\u097F]/u,
    );
  });

  it("states the English preview status without implying a live survey", () => {
    expect(regionalDictionaries.en.surveyBody).toBe(
      "This survey is currently a preview. Responses are not being accepted. Participation dates will be announced after the required privacy, security and operational checks are complete.",
    );
  });

  it.each(locales)(
    "distinguishes the three-seat district from the nine-seat parliamentary constituency in %s",
    (locale) => {
      const dictionary = regionalDictionaries[locale];
      expect(dictionary.fatehgarhBody).toMatch(/3|three|ਤਿੰਨ|तीन/u);
      expect(dictionary.fatehgarhBody).toMatch(/9|nine|ਨੌਂ|नौ/u);
    },
  );
});

import { describe, expect, it } from "vitest";

import { locales } from "@/lib/i18n";

import { registrationPreviewDictionaries } from "./translations";

describe("registration preview translations", () => {
  it("keeps every locale structurally aligned with English", () => {
    const keys = Object.keys(registrationPreviewDictionaries.en).sort();
    for (const locale of locales) {
      expect(
        Object.keys(registrationPreviewDictionaries[locale]).sort(),
      ).toEqual(keys);
    }
  });

  it("marks Punjabi and Hindi as drafts pending human review", () => {
    expect(registrationPreviewDictionaries.pa.draftTranslation).toContain(
      "ਸਮੀਖਿਆ ਬਾਕੀ",
    );
    expect(registrationPreviewDictionaries.hi.draftTranslation).toContain(
      "समीक्षा लंबित",
    );
  });

  it("states that the synthetic choice creates neither membership nor nomination", () => {
    expect(registrationPreviewDictionaries.en.syntheticOnly).toContain(
      "does not create party membership or a formal election nomination",
    );
    expect(registrationPreviewDictionaries.pa.syntheticOnly).toContain(
      "ਪਾਰਟੀ ਮੈਂਬਰਸ਼ਿਪ",
    );
    expect(registrationPreviewDictionaries.hi.syntheticOnly).toContain(
      "पार्टी सदस्यता",
    );
  });
});

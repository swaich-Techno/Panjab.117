import { describe, expect, it } from "vitest";

import { defaultLocale, isLocale, locales, localizePath } from "./i18n";
import { dictionaries } from "./translations";

describe("locale configuration", () => {
  it("supports the three declared languages", () => {
    expect(locales).toEqual(["pa", "hi", "en"]);
    expect(defaultLocale).toBe("pa");
    expect(isLocale("pa")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("switches an existing locale without losing the path or hash", () => {
    expect(localizePath("/en#research", "pa")).toBe("/pa#research");
    expect(localizePath("/hi/about", "en")).toBe("/en/about");
  });

  it("keeps every dictionary structurally aligned with English", () => {
    const referenceKeys = Object.keys(dictionaries.en).sort();

    for (const locale of locales) {
      expect(Object.keys(dictionaries[locale]).sort()).toEqual(referenceKeys);
      expect(Object.values(dictionaries[locale]).every(Boolean)).toBe(true);
    }
  });
});

import { describe, expect, it } from "vitest";

import {
  archivedContentLocales,
  defaultLocale,
  isLocale,
  locales,
  localizePath,
} from "./i18n";
import { dictionaries } from "./translations";

describe("locale configuration", () => {
  it("generates English only while retaining archived copy as source data", () => {
    expect(locales).toEqual(["en"]);
    expect(archivedContentLocales).toEqual(["en", "pa", "hi"]);
    expect(defaultLocale).toBe("en");
    expect(isLocale("en")).toBe(true);
    expect(isLocale("pa")).toBe(false);
    expect(isLocale("fr")).toBe(false);
  });

  it("switches an existing locale without losing the path or hash", () => {
    expect(localizePath("/en#research", "pa")).toBe("/pa#research");
    expect(localizePath("/hi/about", "en")).toBe("/en/about");
  });

  it("keeps every dictionary structurally aligned with English", () => {
    const referenceKeys = Object.keys(dictionaries.en).sort();

    for (const locale of archivedContentLocales) {
      expect(Object.keys(dictionaries[locale]).sort()).toEqual(referenceKeys);
      expect(Object.values(dictionaries[locale]).every(Boolean)).toBe(true);
    }
  });
});

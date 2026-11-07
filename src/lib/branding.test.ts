import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  BRAND_DESCRIPTION,
  BRAND_HEADLINE,
  BRAND_NAME,
  BRAND_NUMBER,
  BRAND_WORD,
  STATE_NAME,
} from "./branding";
import { dictionaries } from "./translations";

const publicEnglishSources = [
  new URL("../app/[locale]/page.tsx", import.meta.url),
  new URL("../components/site-footer.tsx", import.meta.url),
  new URL("../components/site-header.tsx", import.meta.url),
  new URL("../components/survey-preview.tsx", import.meta.url),
];

describe("permanent English branding standard", () => {
  it("separates the organization brand from the geographic state name", () => {
    expect(BRAND_WORD).toBe("PANJAB");
    expect(BRAND_NUMBER).toBe("117");
    expect(BRAND_NAME).toBe("PANJAB 117");
    expect(STATE_NAME).toBe("PUNJAB");
    expect(BRAND_HEADLINE).toBe(
      "PANJAB 117 — Understanding PUNJAB, Constituency by Constituency",
    );
    expect(BRAND_DESCRIPTION).toBe(
      "Independent civic research covering all 117 Assembly constituencies of PUNJAB.",
    );
  });

  it("uses the standard in reusable English dictionary copy", () => {
    const copy = JSON.stringify(dictionaries.en);
    expect(dictionaries.en.siteName).toBe(BRAND_NAME);
    expect(dictionaries.en.heroEyebrow).toContain(STATE_NAME);
    expect(dictionaries.en.identityLabel).toBe(
      `${STATE_NAME} Legislative Assembly`,
    );
    expect(copy).not.toMatch(/\bPanjab 117\b|\bPunjab\b/u);
  });

  it("prevents title-case legacy spelling in public English components", () => {
    for (const sourceUrl of publicEnglishSources) {
      const source = readFileSync(sourceUrl, "utf8");
      expect(source).not.toMatch(/\bPanjab 117\b|\bPunjab\b/u);
    }
  });
});

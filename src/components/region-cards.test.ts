import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { locales } from "@/lib/i18n";
import { getRegionalDictionary } from "@/lib/regional-translations";

import { RegionCards } from "./region-cards";

describe("regional homepage cards", () => {
  it.each(locales)("renders four labelled directory links for %s", (locale) => {
    const dictionary = getRegionalDictionary(locale);
    const html = renderToStaticMarkup(
      createElement(RegionCards, { locale, dictionary }),
    );

    expect((html.match(/<article/g) ?? []).length).toBe(4);
    expect((html.match(/href="\/(?:en|pa|hi)\/regions\//g) ?? []).length).toBe(
      4,
    );
    expect(html).toContain(dictionary.regions.majha.name);
    expect(html).toContain(dictionary.exploreRegion);
  });

  it("includes mobile-first and wider-screen grid classes", () => {
    const html = renderToStaticMarkup(
      createElement(RegionCards, {
        locale: "en",
        dictionary: getRegionalDictionary("en"),
      }),
    );
    expect(html).toContain("grid");
    expect(html).toContain("md:grid-cols-2");
    expect(html).toContain("focus-visible:ring-3");
  });
});

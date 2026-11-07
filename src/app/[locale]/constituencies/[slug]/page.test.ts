import { describe, expect, it } from "vitest";

import { constituencies } from "@/data/constituencies";

import { generateStaticParams } from "./page";

describe("constituency profile routes", () => {
  it("generates one English route for each verified constituency record", () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(117);
    expect(new Set(params.map(({ slug }) => slug)).size).toBe(117);
    expect(params.map(({ slug }) => slug)).toEqual(
      constituencies.map(({ slug }) => slug),
    );
    expect(params.every(({ locale }) => locale === "en")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import {
  constituencies,
  getConstituenciesByRegion,
  regions,
} from "./constituencies";
import {
  fatehgarhSahibParliamentaryGroup,
  fatehgarhSahibSegments,
} from "./fatehgarh-sahib";

describe("Punjab Assembly constituency reference data", () => {
  it("contains every unique constituency number from 1 through 117", () => {
    expect(constituencies).toHaveLength(117);
    expect(constituencies.map(({ number }) => number)).toEqual(
      Array.from({ length: 117 }, (_, index) => index + 1),
    );
    expect(new Set(constituencies.map(({ name }) => name)).size).toBe(117);
  });

  it("marks every cultural classification as requiring human review", () => {
    expect(
      constituencies.every(
        ({ classificationStatus }) =>
          classificationStatus === "human_review_required",
      ),
    ).toBe(true);
    expect(
      regions.reduce(
        (total, region) => total + getConstituenciesByRegion(region).length,
        0,
      ),
    ).toBe(117);
  });

  it("matches the official nine-segment Fatehgarh Sahib grouping", () => {
    expect(fatehgarhSahibSegments.map(({ number }) => number)).toEqual([
      54, 55, 56, 57, 58, 59, 67, 69, 106,
    ]);
    expect(fatehgarhSahibSegments).toHaveLength(9);
    expect(fatehgarhSahibParliamentaryGroup.number).toBe(8);
  });
});

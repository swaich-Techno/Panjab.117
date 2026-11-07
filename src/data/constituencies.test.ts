import { describe, expect, it } from "vitest";

import {
  constituencies,
  constituencySources,
  getConstituenciesByRegion,
  parliamentaryConstituencies,
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
    expect(new Set(constituencies.map(({ slug }) => slug)).size).toBe(117);
    expect(constituencies[54]?.slug).toBe("55-fatehgarh-sahib");
    expect(constituencies[52]?.slug).toBe("53-s-a-s-nagar");
  });

  it("assigns each Assembly constituency to exactly one official parliamentary constituency", () => {
    expect(parliamentaryConstituencies).toHaveLength(13);
    expect(
      parliamentaryConstituencies.every(
        ({ assemblyConstituencyNumbers }) =>
          assemblyConstituencyNumbers.length === 9,
      ),
    ).toBe(true);

    const assignedNumbers = parliamentaryConstituencies.flatMap(
      ({ assemblyConstituencyNumbers }) => assemblyConstituencyNumbers,
    );
    expect(assignedNumbers).toHaveLength(117);
    expect(new Set(assignedNumbers).size).toBe(117);
    expect([...assignedNumbers].sort((left, right) => left - right)).toEqual(
      Array.from({ length: 117 }, (_, index) => index + 1),
    );

    for (const constituency of constituencies) {
      const parliamentaryConstituency = parliamentaryConstituencies.find(
        ({ number }) => number === constituency.parliamentaryConstituencyNumber,
      );
      expect(parliamentaryConstituency?.assemblyConstituencyNumbers).toContain(
        constituency.number,
      );
    }
  });

  it("keeps an explicit, versioned authoritative source record", () => {
    expect(constituencySources.officialBoundaries).toMatchObject({
      orderNumber: 22,
      notificationDate: "2006-06-19",
      recordVersion: "eci-delimitation-order-22-2006",
      lastChecked: "2026-11-07",
    });
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
    expect(
      constituencies
        .filter(
          ({ parliamentaryConstituencyNumber }) =>
            parliamentaryConstituencyNumber === 8,
        )
        .map(({ number }) => number),
    ).toEqual([54, 55, 56, 57, 58, 59, 67, 69, 106]);
  });
});

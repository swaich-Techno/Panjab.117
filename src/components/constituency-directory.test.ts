import { describe, expect, it } from "vitest";

import { constituencies } from "@/data/constituencies";

import { filterConstituencies } from "./constituency-directory";

describe("static constituency directory search", () => {
  it("returns the complete directory for a blank query", () => {
    expect(filterConstituencies(constituencies, "")).toHaveLength(117);
  });

  it("matches names case-insensitively and constituency numbers", () => {
    expect(filterConstituencies(constituencies, "FATEHGARH SAHIB")).toEqual([
      expect.objectContaining({ number: 55, name: "Fatehgarh Sahib" }),
    ]);
    expect(filterConstituencies(constituencies, "55")).toEqual([
      expect.objectContaining({ number: 55, name: "Fatehgarh Sahib" }),
    ]);
  });

  it("returns no entries for an unmatched query", () => {
    expect(filterConstituencies(constituencies, "not-a-place")).toEqual([]);
  });

  it("filters the shared record by provisional cultural region", () => {
    const majha = filterConstituencies(constituencies, "", "majha");
    expect(majha.length).toBeGreaterThan(0);
    expect(
      majha.every(({ proposedRegion }) => proposedRegion === "majha"),
    ).toBe(true);
  });
});

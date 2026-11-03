import { describe, expect, it } from "vitest";

import { summarizeCategories } from "./statistics";

describe("deterministic survey statistics", () => {
  it("handles a zero denominator without NaN or Infinity", () => {
    expect(
      summarizeCategories([null, undefined, ""], { smallCellThreshold: 2 }),
    ).toEqual({
      denominator: 0,
      missing: 3,
      categories: [],
    });
  });

  it("separates missing values from the valid denominator", () => {
    const result = summarizeCategories(["A", "A", "B", null, " "], {
      smallCellThreshold: 1,
    });
    expect(result.denominator).toBe(3);
    expect(result.missing).toBe(2);
    expect(result.categories).toEqual([
      { value: "A", count: 2, percentage: 66.7, suppressed: false },
      { value: "B", count: 1, percentage: 33.3, suppressed: false },
    ]);
  });

  it("suppresses both counts and percentages for small cells", () => {
    const result = summarizeCategories(["A", "A", "A", "B"], {
      smallCellThreshold: 2,
    });
    expect(result.categories[1]).toEqual({
      value: "B",
      count: null,
      percentage: null,
      suppressed: true,
    });
  });
});

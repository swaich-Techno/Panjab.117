export type CategoryStatistic = {
  value: string;
  count: number | null;
  percentage: number | null;
  suppressed: boolean;
};

export type CategorySummary = {
  denominator: number;
  missing: number;
  categories: CategoryStatistic[];
};

export function summarizeCategories(
  values: readonly (string | null | undefined)[],
  options: { smallCellThreshold: number },
): CategorySummary {
  if (
    !Number.isInteger(options.smallCellThreshold) ||
    options.smallCellThreshold < 1
  ) {
    throw new Error("smallCellThreshold must be a positive integer");
  }

  const counts = new Map<string, number>();
  let missing = 0;

  for (const value of values) {
    const normalized = value?.trim();
    if (!normalized) {
      missing += 1;
      continue;
    }
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  const denominator = values.length - missing;
  const categories = [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right, "en"))
    .map(([value, count]): CategoryStatistic => {
      const suppressed = count < options.smallCellThreshold;
      return {
        value,
        count: suppressed ? null : count,
        percentage:
          suppressed || denominator === 0
            ? null
            : Number(((count / denominator) * 100).toFixed(1)),
        suppressed,
      };
    });

  return { denominator, missing, categories };
}

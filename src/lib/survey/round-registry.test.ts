import { describe, expect, it } from "vitest";

import {
  getSurveyInstance,
  surveyInstances,
  surveyRoundIds,
  surveyRounds,
} from "./round-registry";

describe("survey round registry", () => {
  it("creates 117 distinct instances for each of four isolated rounds", () => {
    expect(surveyRoundIds).toHaveLength(4);
    expect(surveyInstances).toHaveLength(468);
    expect(
      new Set(surveyInstances.map(({ surveyInstanceId }) => surveyInstanceId))
        .size,
    ).toBe(468);
    for (const roundId of surveyRoundIds) {
      expect(
        surveyInstances.filter(
          ({ surveyRoundId }) => surveyRoundId === roundId,
        ),
      ).toHaveLength(117);
    }
  });

  it("routes Samrala to the correct round workbook", () => {
    const instance = getSurveyInstance("PRE1", 58);
    expect(instance).toMatchObject({
      surveyInstanceId: "PRE1-058",
      assemblyConstituencyName: "Samrala",
      parliamentaryConstituency: "Fatehgarh Sahib",
      destinationKey: surveyRounds.PRE1.destinationKey,
      collectionEnabled: false,
    });
  });

  it("keeps EXIT unscheduled and every collection route disabled", () => {
    expect(surveyRounds.EXIT.plannedPeriod).toBeNull();
    expect(
      surveyInstances.every(({ collectionEnabled }) => !collectionEnabled),
    ).toBe(true);
    expect(
      Object.values(surveyRounds).every(
        ({ collectionEnabled, confidentialStorageApproved }) =>
          !collectionEnabled && !confidentialStorageApproved,
      ),
    ).toBe(true);
  });

  it.each([0, 118, 1.5])("rejects invalid constituency %s", (number) => {
    expect(() => getSurveyInstance("PRE1", number)).toThrow();
  });
});

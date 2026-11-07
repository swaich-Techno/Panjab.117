import { describe, expect, it } from "vitest";

import {
  assertSurveyIntakeAllowed,
  fatehgarhSahibDraftSchedule,
  getSurveyAvailability,
  type SurveySchedule,
} from "./schedule";

const approvedOpenSchedule: SurveySchedule = {
  ...fatehgarhSahibDraftSchedule,
  state: "open",
  launchApproved: true,
  approvals: {
    productionSecurity: true,
    privacy: true,
    consent: true,
    backupAndRecovery: true,
    operations: true,
  },
};

describe("survey scheduling guard", () => {
  it("keeps the checked-in schedule disabled", () => {
    const result = getSurveyAvailability(
      fatehgarhSahibDraftSchedule,
      new Date("2026-11-10T00:00:00.000Z"),
    );
    expect(result).toEqual({
      state: "draft",
      intakeEnabled: false,
      reason: "draft",
    });
    expect(fatehgarhSahibDraftSchedule.launchApproved).toBe(false);
    expect(Object.values(fatehgarhSahibDraftSchedule.approvals)).toEqual([
      false,
      false,
      false,
      false,
      false,
    ]);
  });

  it("uses an inclusive opening and exclusive closing boundary", () => {
    expect(
      getSurveyAvailability(
        approvedOpenSchedule,
        new Date("2026-11-09T18:29:59.999Z"),
      ).intakeEnabled,
    ).toBe(false);
    expect(
      getSurveyAvailability(
        approvedOpenSchedule,
        new Date("2026-11-09T18:30:00.000Z"),
      ).intakeEnabled,
    ).toBe(true);
    expect(
      getSurveyAvailability(
        approvedOpenSchedule,
        new Date("2026-11-15T18:29:59.999Z"),
      ).intakeEnabled,
    ).toBe(true);
    expect(
      getSurveyAvailability(
        approvedOpenSchedule,
        new Date("2026-11-15T18:30:00.000Z"),
      ),
    ).toMatchObject({
      state: "closed",
      intakeEnabled: false,
      reason: "window_closed",
    });
  });

  it("requires explicit launch and every operational approval", () => {
    const inWindow = new Date("2026-11-10T00:00:00.000Z");
    expect(
      getSurveyAvailability(
        { ...approvedOpenSchedule, launchApproved: false },
        inWindow,
      ).reason,
    ).toBe("launch_not_approved");
    expect(
      getSurveyAvailability(
        {
          ...approvedOpenSchedule,
          approvals: { ...approvedOpenSchedule.approvals, privacy: false },
        },
        inWindow,
      ).reason,
    ).toBe("operational_approvals_missing");
  });

  it.each(["paused", "closed", "archived"] as const)(
    "denies intake while %s",
    (state) => {
      expect(() =>
        assertSurveyIntakeAllowed(
          { ...approvedOpenSchedule, state },
          new Date("2026-11-10T00:00:00.000Z"),
        ),
      ).toThrow("Survey intake unavailable");
    },
  );
});

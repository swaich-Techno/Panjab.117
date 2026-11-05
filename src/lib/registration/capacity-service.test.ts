import { describe, expect, it } from "vitest";

import {
  SyntheticRegistrationCapacityService,
  type SyntheticRegistrationAttempt,
} from "./capacity-service";

function attempt(
  index: number,
  overrides: Partial<SyntheticRegistrationAttempt> = {},
): SyntheticRegistrationAttempt {
  return {
    synthetic: true,
    idempotencyKey: `synthetic-idempotency-${index}`,
    syntheticParticipantHash: `synthetic-participant-${index}`,
    assemblyConstituencyId: 55,
    categoryId: "aap",
    consent: {
      registration: true,
      politicalOpinion: true,
      version: "synthetic-consent-v1",
    },
    ...overrides,
  };
}

describe("synthetic registration capacity service", () => {
  it("atomically confirms exactly 100 of 101 parallel attempts", async () => {
    const service = new SyntheticRegistrationCapacityService({
      emergencyStop: false,
    });
    const outcomes = await Promise.all(
      Array.from({ length: 101 }, (_, index) =>
        service.register(attempt(index)),
      ),
    );
    expect(
      outcomes.filter(({ status }) => status === "confirmed"),
    ).toHaveLength(100);
    expect(
      outcomes.filter(({ status }) => status === "capacity_reached"),
    ).toHaveLength(1);
    expect(service.confirmedCount("aap")).toBe(100);
  });

  it("returns an idempotent replay without consuming capacity", async () => {
    const service = new SyntheticRegistrationCapacityService({
      emergencyStop: false,
    });
    const first = await service.register(attempt(1));
    const replay = await service.register(attempt(1));
    expect(first.status).toBe("confirmed");
    expect(replay.status).toBe("idempotent_replay");
    expect(service.confirmedCount("aap")).toBe(1);
  });

  it("rejects duplicate participants across categories", async () => {
    const service = new SyntheticRegistrationCapacityService({
      emergencyStop: false,
    });
    await service.register(attempt(1));
    const duplicate = await service.register(
      attempt(2, {
        categoryId: "inc",
        syntheticParticipantHash: "synthetic-participant-1",
      }),
    );
    expect(duplicate.status).toBe("duplicate");
    expect(service.confirmedCount("inc")).toBe(0);
  });

  it("releases capacity only after verified withdrawal", async () => {
    const service = new SyntheticRegistrationCapacityService({
      capacityPerTopLevelCategory: 1,
      emergencyStop: false,
    });
    const confirmed = await service.register(attempt(1));
    expect(confirmed.status).toBe("confirmed");
    if (confirmed.status !== "confirmed")
      throw new Error("Expected confirmation");

    expect(await service.withdraw(confirmed.registrationId, false)).toEqual({
      status: "verification_required",
      releasedCapacity: false,
    });
    expect((await service.register(attempt(2))).status).toBe(
      "capacity_reached",
    );
    expect(await service.withdraw(confirmed.registrationId, true)).toEqual({
      status: "withdrawn",
      releasedCapacity: true,
    });
    expect((await service.register(attempt(3))).status).toBe("confirmed");
  });

  it("fails closed for emergency stop, disabled alliance and invalid attempts", async () => {
    const service = new SyntheticRegistrationCapacityService();
    expect((await service.register(attempt(1))).status).toBe("emergency_stop");
    service.setEmergencyStop(false);
    expect(
      (await service.register(attempt(2, { categoryId: "bjp_sad_alliance" })))
        .status,
    ).toBe("category_disabled");
    expect(
      (await service.register(attempt(3, { assemblyConstituencyId: 1 })))
        .status,
    ).toBe("invalid");
    expect(service.confirmedCount("bjp_sad_alliance")).toBe(0);
  });

  it("requires a specific Others choice and keeps BJP available", async () => {
    const service = new SyntheticRegistrationCapacityService({
      emergencyStop: false,
    });
    expect(
      (await service.register(attempt(1, { categoryId: "others" }))).status,
    ).toBe("invalid");
    expect(
      (
        await service.register(
          attempt(2, {
            categoryId: "others",
            otherPartyChoiceId: "bjp",
          }),
        )
      ).status,
    ).toBe("confirmed");
  });

  it("does not commit capacity when the durable write fails", async () => {
    const service = new SyntheticRegistrationCapacityService({
      emergencyStop: false,
      beforeCommit: async () => {
        throw new Error("synthetic database unavailable");
      },
    });
    await expect(service.register(attempt(1))).rejects.toThrow(
      "synthetic database unavailable",
    );
    expect(service.confirmedCount("aap")).toBe(0);
  });
});

import { describe, expect, it } from "vitest";

import {
  opinionOnlyChoices,
  otherPartyChoices,
  partyCategories,
} from "./parties";

describe("registration party categories", () => {
  it("keeps the approved top-level order and disables the unconfirmed alliance", () => {
    expect(partyCategories.map(({ id }) => id)).toEqual([
      "sad",
      "inc",
      "aap",
      "ad_wpd",
      "others",
      "bjp_sad_alliance",
    ]);
    expect(
      partyCategories.find(({ id }) => id === "bjp_sad_alliance"),
    ).toMatchObject({
      enabled: false,
      classification: "proposed_alliance_unconfirmed",
    });
  });

  it("keeps BJP selectable under Others and labels WPD cautiously", () => {
    expect(otherPartyChoices).toContainEqual(
      expect.objectContaining({ id: "bjp", name: "Bharatiya Janata Party" }),
    );
    expect(partyCategories.find(({ id }) => id === "ad_wpd")).toMatchObject({
      classification: "political_organisation_registration_unconfirmed",
    });
  });

  it("does not treat optional opinion answers as registrations", () => {
    expect(opinionOnlyChoices).toEqual([
      "undecided",
      "none",
      "prefer_not_to_say",
    ]);
    expect(
      partyCategories.some(({ id }) =>
        opinionOnlyChoices.includes(id as (typeof opinionOnlyChoices)[number]),
      ),
    ).toBe(false);
  });
});

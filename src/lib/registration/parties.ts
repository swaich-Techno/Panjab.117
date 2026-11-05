export const partyCategoryIds = [
  "sad",
  "inc",
  "aap",
  "ad_wpd",
  "others",
  "bjp_sad_alliance",
] as const;

export type PartyCategoryId = (typeof partyCategoryIds)[number];

export type PartyCategory = {
  id: PartyCategoryId;
  shortName: string;
  name: string;
  enabled: boolean;
  classification:
    | "political_party"
    | "political_organisation_registration_unconfirmed"
    | "umbrella_category"
    | "proposed_alliance_unconfirmed";
  statusNote: string;
};

export const partyCategories: readonly PartyCategory[] = [
  {
    id: "sad",
    shortName: "SAD",
    name: "Shiromani Akali Dal",
    enabled: true,
    classification: "political_party",
    statusNote: "Active as a separate registration category.",
  },
  {
    id: "inc",
    shortName: "INC",
    name: "Indian National Congress",
    enabled: true,
    classification: "political_party",
    statusNote: "Active as a separate registration category.",
  },
  {
    id: "aap",
    shortName: "AAP",
    name: "Aam Aadmi Party",
    enabled: true,
    classification: "political_party",
    statusNote: "Active as a separate registration category.",
  },
  {
    id: "ad_wpd",
    shortName: "AD-WPD",
    name: "Akali Dal (Waris Punjab De)",
    enabled: true,
    classification: "political_organisation_registration_unconfirmed",
    statusNote:
      "Treated as a political organisation for this prototype. ECI political-party registration has not been verified.",
  },
  {
    id: "others",
    shortName: "OTHERS",
    name: "Other parties and independents",
    enabled: true,
    classification: "umbrella_category",
    statusNote:
      "A shared top-level pilot category with a required specific choice.",
  },
  {
    id: "bjp_sad_alliance",
    shortName: "BJP–SAD",
    name: "Proposed BJP–SAD alliance",
    enabled: false,
    classification: "proposed_alliance_unconfirmed",
    statusNote:
      "Disabled. No formal alliance and constituency-level arrangement has been verified.",
  },
];

export const otherPartyChoiceIds = [
  "bjp",
  "bsp",
  "sad_amritsar",
  "independent",
  "other_party_not_listed",
] as const;

export type OtherPartyChoiceId = (typeof otherPartyChoiceIds)[number];

export type OtherPartyChoice = {
  id: OtherPartyChoiceId;
  shortName: string;
  name: string;
  classification: "political_party" | "independent" | "other";
};

export const otherPartyChoices: readonly OtherPartyChoice[] = [
  {
    id: "bjp",
    shortName: "BJP",
    name: "Bharatiya Janata Party",
    classification: "political_party",
  },
  {
    id: "bsp",
    shortName: "BSP",
    name: "Bahujan Samaj Party",
    classification: "political_party",
  },
  {
    id: "sad_amritsar",
    shortName: "SAD (Amritsar)",
    name: "Shiromani Akali Dal (Amritsar)",
    classification: "political_party",
  },
  {
    id: "independent",
    shortName: "Independent",
    name: "Independent",
    classification: "independent",
  },
  {
    id: "other_party_not_listed",
    shortName: "Other",
    name: "Other party not listed",
    classification: "other",
  },
];

export const opinionOnlyChoices = [
  "undecided",
  "none",
  "prefer_not_to_say",
] as const;

export function getPartyCategory(id: PartyCategoryId): PartyCategory {
  const category = partyCategories.find((item) => item.id === id);
  if (!category) throw new Error(`Unknown party category: ${id}`);
  return category;
}

export function getOtherPartyChoice(id: OtherPartyChoiceId): OtherPartyChoice {
  const choice = otherPartyChoices.find((item) => item.id === id);
  if (!choice) throw new Error(`Unknown other-party choice: ${id}`);
  return choice;
}

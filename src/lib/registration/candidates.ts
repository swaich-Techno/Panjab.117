import type { PartyCategoryId } from "./parties";

export const candidateAnnouncementStatuses = [
  "officially_announced_by_party",
  "reported_or_proposed_not_confirmed",
  "no_verified_announcement",
  "withdrawn_or_replaced",
] as const;

export type CandidateAnnouncementStatus =
  (typeof candidateAnnouncementStatuses)[number];

export const candidateStatusLabels: Record<
  CandidateAnnouncementStatus,
  string
> = {
  officially_announced_by_party: "Officially announced by party",
  reported_or_proposed_not_confirmed: "Reported/proposed, not confirmed",
  no_verified_announcement: "No verified announcement",
  withdrawn_or_replaced: "Withdrawn/replaced, with evidence",
};

export type CandidateStatusHistoryEntry = {
  status: CandidateAnnouncementStatus;
  effectiveDate: string;
  sourceUrl: string;
  note: string;
};

export type CandidateRecord = {
  recordVersion: string;
  assemblyConstituencyId: number;
  assemblyConstituencyName: string;
  partyOrOrganisationId: PartyCategoryId;
  candidateFullName: string;
  announcementStatus: CandidateAnnouncementStatus;
  announcementDate: string | null;
  sourceUrl: string;
  lastVerificationDate: string;
  statusHistory: readonly CandidateStatusHistoryEntry[];
  notes: string;
};

const aapSourceUrl =
  "https://aamaadmiparty.org/aap-news/aap-leads-from-the-front-first-list-of-40-candidates-announced-for-punjab-assembly-elections-2027/";
const adWpdSourceUrl =
  "https://www.tribuneindia.com/news/punjab/akali-dal-waris-punjab-de-names-satwant-singh-son-of-indira-gandhi-case-convict-kehar-singh-as-first-candidate-for-2027-election/";

function officialAapCandidate(
  assemblyConstituencyId: number,
  assemblyConstituencyName: string,
  candidateFullName: string,
): CandidateRecord {
  return {
    recordVersion: "fatehgarh-sahib-candidates-2026-11-05-v1",
    assemblyConstituencyId,
    assemblyConstituencyName,
    partyOrOrganisationId: "aap",
    candidateFullName,
    announcementStatus: "officially_announced_by_party",
    announcementDate: "2026-10-31",
    sourceUrl: aapSourceUrl,
    lastVerificationDate: "2026-11-05",
    statusHistory: [
      {
        status: "officially_announced_by_party",
        effectiveDate: "2026-10-31",
        sourceUrl: aapSourceUrl,
        note: "Included in AAP's official first list for the 2027 election.",
      },
    ],
    notes:
      "Candidate spelling follows the supplied official AAP announcement record and requires continued update monitoring.",
  };
}

export const candidateDirectory: readonly CandidateRecord[] = [
  {
    recordVersion: "fatehgarh-sahib-candidates-2026-11-05-v1",
    assemblyConstituencyId: 54,
    assemblyConstituencyName: "Bassi Pathana (SC)",
    partyOrOrganisationId: "ad_wpd",
    candidateFullName: "Satwant Singh",
    announcementStatus: "reported_or_proposed_not_confirmed",
    announcementDate: "2026-08-10",
    sourceUrl: adWpdSourceUrl,
    lastVerificationDate: "2026-11-05",
    statusHistory: [
      {
        status: "reported_or_proposed_not_confirmed",
        effectiveDate: "2026-08-10",
        sourceUrl: adWpdSourceUrl,
        note: "The Tribune reported an announcement by Akali Dal (Waris Punjab De). Direct primary evidence and ECI party-registration status remain unresolved.",
      },
    ],
    notes:
      "This record does not describe Waris Punjab De as an ECI-registered political party.",
  },
  officialAapCandidate(55, "Fatehgarh Sahib", "Lakhbir Singh Rai"),
  officialAapCandidate(56, "Amloh", "Gurinder Singh Garry Waring"),
  officialAapCandidate(58, "Samrala", "Jagtar Singh Diyalpura"),
  officialAapCandidate(67, "Payal (SC)", "Manwinder Singh Giaspura"),
  officialAapCandidate(106, "Amargarh", "Jaswant Singh Gajjan Majra"),
];

export function findCandidateRecord(
  assemblyConstituencyId: number,
  partyOrOrganisationId: PartyCategoryId,
): CandidateRecord | null {
  return (
    candidateDirectory.find(
      (record) =>
        record.assemblyConstituencyId === assemblyConstituencyId &&
        record.partyOrOrganisationId === partyOrOrganisationId &&
        record.announcementStatus !== "withdrawn_or_replaced",
    ) ?? null
  );
}

export type CandidateUpdate = {
  status: CandidateAnnouncementStatus;
  effectiveDate: string;
  sourceUrl: string;
  verificationDate: string;
  note: string;
  candidateFullName?: string;
};

export function applyCandidateUpdate(
  current: CandidateRecord,
  update: CandidateUpdate,
): CandidateRecord {
  if (!update.sourceUrl.startsWith("https://")) {
    throw new Error("Candidate updates require an HTTPS source URL.");
  }
  if (update.verificationDate < current.lastVerificationDate) {
    throw new Error("Candidate verification dates cannot move backwards.");
  }
  return {
    ...current,
    candidateFullName: update.candidateFullName ?? current.candidateFullName,
    announcementStatus: update.status,
    announcementDate:
      update.status === "no_verified_announcement"
        ? null
        : update.effectiveDate,
    sourceUrl: update.sourceUrl,
    lastVerificationDate: update.verificationDate,
    statusHistory: [
      ...current.statusHistory,
      {
        status: update.status,
        effectiveDate: update.effectiveDate,
        sourceUrl: update.sourceUrl,
        note: update.note,
      },
    ],
    notes: update.note,
  };
}

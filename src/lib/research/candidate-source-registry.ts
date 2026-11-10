import type { CandidateSourceRecord } from "./candidate-intelligence";

// Deliberately empty: no candidate has been added without source evidence and
// a named human decision. Synthetic test records live only in test files.
export const verifiedCandidateSourceRegistry: readonly CandidateSourceRecord[] =
  [];

export function getPublishedCandidateRecords(
  constituencyNumber: number,
): readonly CandidateSourceRecord[] {
  return verifiedCandidateSourceRegistry.filter(
    (record) =>
      record.constituencyNumber === constituencyNumber &&
      record.reviewerDecision === "accepted" &&
      record.publicationStatus === "published",
  );
}

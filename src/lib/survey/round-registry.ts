import {
  constituencies,
  parliamentaryConstituencies,
} from "@/data/constituencies";

export const surveyRoundIds = ["PRE1", "PRE2", "PRE3", "EXIT"] as const;
export type SurveyRoundId = (typeof surveyRoundIds)[number];

export type SurveyRoundDefinition = {
  id: SurveyRoundId;
  destinationKey: string;
  spreadsheetName: string;
  plannedPeriod: string | null;
  collectionEnabled: false;
  confidentialStorageApproved: false;
};

export const surveyRounds: Readonly<
  Record<SurveyRoundId, SurveyRoundDefinition>
> = {
  PRE1: {
    id: "PRE1",
    destinationKey: "PANJAB117_PRE1_SHEET_ID",
    spreadsheetName: "15 NOV - 15 DEC",
    plannedPeriod: "2026-11-15/2026-12-15",
    collectionEnabled: false,
    confidentialStorageApproved: false,
  },
  PRE2: {
    id: "PRE2",
    destinationKey: "PANJAB117_PRE2_SHEET_ID",
    spreadsheetName: "15 DEC - 15 JAN",
    plannedPeriod: "2026-12-15/2027-01-15",
    collectionEnabled: false,
    confidentialStorageApproved: false,
  },
  PRE3: {
    id: "PRE3",
    destinationKey: "PANJAB117_PRE3_SHEET_ID",
    spreadsheetName: "15 JAN - 15 FEB",
    plannedPeriod: "2027-01-15/2027-02-15",
    collectionEnabled: false,
    confidentialStorageApproved: false,
  },
  EXIT: {
    id: "EXIT",
    destinationKey: "PANJAB117_EXIT_SHEET_ID",
    spreadsheetName: "EXIT POLL",
    plannedPeriod: null,
    collectionEnabled: false,
    confidentialStorageApproved: false,
  },
};

export const masterDashboardDestinationKey =
  "PANJAB117_MASTER_SHEET_ID" as const;

export type SurveyInstance = {
  surveyRoundId: SurveyRoundId;
  surveyInstanceId: `${SurveyRoundId}-${string}`;
  assemblyConstituencyNumber: number;
  assemblyConstituencyName: string;
  parliamentaryConstituency: string;
  destinationKey: string;
  collectionEnabled: false;
};

function constituencyCode(number: number): string {
  return String(number).padStart(3, "0");
}

export const surveyInstances: readonly SurveyInstance[] =
  surveyRoundIds.flatMap((surveyRoundId) =>
    constituencies.map((constituency): SurveyInstance => {
      const parliamentary = parliamentaryConstituencies.find(
        ({ number }) => number === constituency.parliamentaryConstituencyNumber,
      );
      if (!parliamentary) {
        throw new Error(
          `Missing parliamentary constituency for ${constituency.number}`,
        );
      }
      return {
        surveyRoundId,
        surveyInstanceId: `${surveyRoundId}-${constituencyCode(constituency.number)}`,
        assemblyConstituencyNumber: constituency.number,
        assemblyConstituencyName: constituency.name,
        parliamentaryConstituency: parliamentary.name,
        destinationKey: surveyRounds[surveyRoundId].destinationKey,
        collectionEnabled: false,
      };
    }),
  );

export function getSurveyInstance(
  surveyRoundId: SurveyRoundId,
  assemblyConstituencyNumber: number,
): SurveyInstance {
  if (!Number.isSafeInteger(assemblyConstituencyNumber)) {
    throw new Error("Assembly constituency number must be an integer");
  }
  const instance = surveyInstances.find(
    (candidate) =>
      candidate.surveyRoundId === surveyRoundId &&
      candidate.assemblyConstituencyNumber === assemblyConstituencyNumber,
  );
  if (!instance) {
    throw new Error("Unknown survey round or Assembly constituency");
  }
  return instance;
}

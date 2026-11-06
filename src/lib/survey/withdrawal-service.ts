import type { DeletionLedgerEntry } from "@/lib/security/backup";

import { verifySyntheticWithdrawalCode } from "./consent";
import {
  InMemorySecureIntakeRepository,
  type SecureSurveyRecord,
} from "./secure-intake";

export type SyntheticWithdrawalOutcome =
  | {
      status: "verified_and_deleted";
      responseId: string;
      deletionLedger: readonly DeletionLedgerEntry[];
    }
  | {
      status: "invalid" | "expired" | "locked" | "already_redeemed";
      responseId: null;
      deletionLedger: readonly [];
    };

export function processSyntheticWithdrawal(
  record: SecureSurveyRecord,
  candidateCode: string,
  checkedAt: string,
  syntheticHmacKey: Buffer,
  repository: InMemorySecureIntakeRepository,
): SyntheticWithdrawalOutcome {
  const currentRecord = repository.get(record.responseId);
  if (!currentRecord) {
    throw new Error("Response not found");
  }
  const verification = verifySyntheticWithdrawalCode(
    currentRecord.withdrawalCode,
    candidateCode,
    checkedAt,
    syntheticHmacKey,
  );

  if (verification.outcome !== "verified") {
    if (verification.record !== currentRecord.withdrawalCode) {
      repository.replace({
        ...currentRecord,
        withdrawalCode: verification.record,
      });
    }
    return {
      status: verification.outcome,
      responseId: null,
      deletionLedger: [],
    };
  }

  const deletionLedger: DeletionLedgerEntry[] = [
    {
      responseId: currentRecord.responseId,
      action: "destroy_answer_key",
      recordedAt: checkedAt,
    },
  ];
  if (currentRecord.political !== null) {
    deletionLedger.push({
      responseId: currentRecord.responseId,
      action: "destroy_political_answer_key",
      recordedAt: checkedAt,
    });
  }

  repository.replace({
    ...currentRecord,
    withdrawalState: "live_data_deleted",
    civic: null,
    political: null,
    withdrawalCode: verification.record,
  });

  return {
    status: "verified_and_deleted",
    responseId: currentRecord.responseId,
    deletionLedger,
  };
}

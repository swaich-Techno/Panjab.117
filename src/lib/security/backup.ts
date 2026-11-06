import { createHash } from "node:crypto";

import {
  createOwnedDataKey,
  decryptBuffer,
  destroyPlaintextDataKey,
  encryptBuffer,
  type EncryptedEnvelope,
  type KeyProvider,
  type WrappedDataKey,
} from "./encryption";

export interface BackupManifest {
  formatVersion: 1;
  backupId: string;
  createdAt: string;
  schemaVersion: string;
  databaseVersion: string;
  plaintextSha256: string;
  deletionLedgerSha256: string;
}

export interface EncryptedBackupArtifact {
  formatVersion: 1;
  manifest: BackupManifest;
  envelope: EncryptedEnvelope;
  wrappedKey: WrappedDataKey;
}

export interface DeletionLedgerEntry {
  responseId: string;
  action:
    | "destroy_answer_key"
    | "destroy_political_answer_key"
    | "destroy_identity_key";
  recordedAt: string;
}

export function mustSuppressRestoredResponse(
  responseId: string,
  deletionLedger: readonly DeletionLedgerEntry[],
): boolean {
  return deletionLedger.some(
    (entry) =>
      entry.responseId === responseId &&
      (entry.action === "destroy_answer_key" ||
        entry.action === "destroy_political_answer_key" ||
        entry.action === "destroy_identity_key"),
  );
}

function sha256(value: Buffer | string): string {
  return createHash("sha256").update(value).digest("base64url");
}

function canonicalizeManifest(manifest: BackupManifest): string {
  return JSON.stringify({
    backupId: manifest.backupId,
    createdAt: manifest.createdAt,
    databaseVersion: manifest.databaseVersion,
    deletionLedgerSha256: manifest.deletionLedgerSha256,
    formatVersion: manifest.formatVersion,
    plaintextSha256: manifest.plaintextSha256,
    schemaVersion: manifest.schemaVersion,
  });
}

export function canonicalizeDeletionLedger(
  entries: readonly DeletionLedgerEntry[],
): string {
  return JSON.stringify(
    [...entries].sort((left, right) => {
      const leftValue = `${left.recordedAt}:${left.responseId}:${left.action}`;
      const rightValue = `${right.recordedAt}:${right.responseId}:${right.action}`;
      return leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
    }),
  );
}

export function createEncryptedBackup(
  logicalDump: Buffer,
  input: {
    backupId: string;
    createdAt: string;
    schemaVersion: string;
    databaseVersion: string;
    deletionLedger: readonly DeletionLedgerEntry[];
  },
  provider: KeyProvider,
): EncryptedBackupArtifact {
  const manifest: BackupManifest = {
    formatVersion: 1,
    backupId: input.backupId,
    createdAt: input.createdAt,
    schemaVersion: input.schemaVersion,
    databaseVersion: input.databaseVersion,
    plaintextSha256: sha256(logicalDump),
    deletionLedgerSha256: sha256(
      canonicalizeDeletionLedger(input.deletionLedger),
    ),
  };
  const dataKey = createOwnedDataKey("backup", input.backupId, provider);

  try {
    return {
      formatVersion: 1,
      manifest,
      envelope: encryptBuffer(
        logicalDump,
        {
          purpose: "backup",
          ownerId: input.backupId,
          schema: "backup",
          table: "logical_dump",
          rowId: input.backupId,
          field: "payload",
          attributes: {
            deletionLedgerSha256: manifest.deletionLedgerSha256,
            manifestSha256: sha256(canonicalizeManifest(manifest)),
            plaintextSha256: manifest.plaintextSha256,
            schemaVersion: manifest.schemaVersion,
          },
        },
        dataKey,
      ),
      wrappedKey: dataKey.wrappedKey,
    };
  } finally {
    destroyPlaintextDataKey(dataKey);
  }
}

export function restoreEncryptedBackup(
  artifact: EncryptedBackupArtifact,
  deletionLedger: readonly DeletionLedgerEntry[],
  provider: KeyProvider,
): Buffer {
  if (
    artifact.formatVersion !== 1 ||
    artifact.manifest.formatVersion !== 1 ||
    sha256(canonicalizeDeletionLedger(deletionLedger)) !==
      artifact.manifest.deletionLedgerSha256
  ) {
    throw new Error("Backup integrity verification failed");
  }

  const plaintext = decryptBuffer(
    artifact.envelope,
    {
      purpose: "backup",
      ownerId: artifact.manifest.backupId,
      schema: "backup",
      table: "logical_dump",
      rowId: artifact.manifest.backupId,
      field: "payload",
      attributes: {
        deletionLedgerSha256: artifact.manifest.deletionLedgerSha256,
        manifestSha256: sha256(canonicalizeManifest(artifact.manifest)),
        plaintextSha256: artifact.manifest.plaintextSha256,
        schemaVersion: artifact.manifest.schemaVersion,
      },
    },
    artifact.wrappedKey,
    provider,
  );

  if (sha256(plaintext) !== artifact.manifest.plaintextSha256) {
    throw new Error("Backup integrity verification failed");
  }

  return plaintext;
}

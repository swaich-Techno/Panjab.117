import { describe, expect, it } from "vitest";

import {
  createEncryptedBackup,
  restoreEncryptedBackup,
  type DeletionLedgerEntry,
  type EncryptedBackupArtifact,
} from "./backup";
import { InMemoryKeyProvider } from "./fake-key-provider";

const ledger: readonly DeletionLedgerEntry[] = [
  {
    responseId: "synthetic-deleted-response",
    action: "destroy_identity_key",
    recordedAt: "2026-11-03T12:00:00.000Z",
  },
];

function backupProvider(): InMemoryKeyProvider {
  const provider = new InMemoryKeyProvider();
  provider.addKey("backup", 1, Buffer.alloc(32, 0x66));
  return provider;
}

describe("authenticated backup artifact", () => {
  it("encrypts, verifies, and restores a synthetic logical dump", () => {
    const provider = backupProvider();
    const dump = Buffer.from("-- synthetic MySQL logical dump\nSELECT 1;\n");
    const artifact = createEncryptedBackup(
      dump,
      {
        backupId: "synthetic-backup-001",
        createdAt: "2026-11-03T12:00:00.000Z",
        schemaVersion: "2b-poc-1",
        databaseVersion: "8.4.13",
        deletionLedger: ledger,
      },
      provider,
    );

    expect(
      restoreEncryptedBackup(artifact, ledger, provider).equals(dump),
    ).toBe(true);
  });

  it("rejects corrupted ciphertext and deletion-ledger mismatch", () => {
    const provider = backupProvider();
    const artifact = createEncryptedBackup(
      Buffer.from("synthetic"),
      {
        backupId: "synthetic-backup-002",
        createdAt: "2026-11-03T12:00:00.000Z",
        schemaVersion: "2b-poc-1",
        databaseVersion: "8.4.13",
        deletionLedger: ledger,
      },
      provider,
    );
    const corrupted: EncryptedBackupArtifact = {
      ...artifact,
      envelope: {
        ...artifact.envelope,
        ciphertext: Buffer.from("corrupted").toString("base64url"),
      },
    };

    expect(() => restoreEncryptedBackup(corrupted, ledger, provider)).toThrow(
      "Authenticated decryption failed",
    );
    expect(() => restoreEncryptedBackup(artifact, [], provider)).toThrow(
      "Backup integrity verification failed",
    );
    expect(() =>
      restoreEncryptedBackup(
        {
          ...artifact,
          manifest: { ...artifact.manifest, databaseVersion: "changed" },
        },
        ledger,
        provider,
      ),
    ).toThrow("Authenticated decryption failed");
  });
});

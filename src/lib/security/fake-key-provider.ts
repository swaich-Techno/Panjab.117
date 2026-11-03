import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import type { KeyProvider, KeyPurpose, WrappedDataKey } from "./encryption";

interface KeyEntry {
  id: string;
  key: Buffer;
}

function wrapAad(
  purpose: KeyPurpose,
  ownerId: string,
  dataKeyId: string,
  version: number,
): Buffer {
  return Buffer.from(
    JSON.stringify({ dataKeyId, ownerId, purpose, version }),
    "utf8",
  );
}

export class InMemoryKeyProvider implements KeyProvider {
  readonly #keys = new Map<KeyPurpose, Map<number, KeyEntry>>();
  readonly #activeVersions = new Map<KeyPurpose, number>();

  addKey(
    purpose: KeyPurpose,
    version: number,
    key: Buffer = randomBytes(32),
  ): void {
    if (!Number.isSafeInteger(version) || version < 1 || key.length !== 32) {
      throw new Error("Invalid key version or key length");
    }

    const purposeKeys = this.#keys.get(purpose) ?? new Map<number, KeyEntry>();

    if (purposeKeys.has(version)) {
      throw new Error("Key version already exists");
    }

    purposeKeys.set(version, {
      id: `memory://${purpose}/v${version}`,
      key: Buffer.from(key),
    });
    this.#keys.set(purpose, purposeKeys);
    this.#activeVersions.set(purpose, version);
  }

  setActiveVersion(purpose: KeyPurpose, version: number): void {
    if (!this.#keys.get(purpose)?.has(version)) {
      throw new Error("Unknown key version");
    }

    this.#activeVersions.set(purpose, version);
  }

  removeKey(purpose: KeyPurpose, version: number): void {
    const entry = this.#keys.get(purpose)?.get(version);
    entry?.key.fill(0);
    this.#keys.get(purpose)?.delete(version);

    if (this.#activeVersions.get(purpose) === version) {
      this.#activeVersions.delete(purpose);
    }
  }

  wrapDataKey(input: {
    purpose: KeyPurpose;
    ownerId: string;
    dataKeyId: string;
    plaintextKey: Buffer;
  }): WrappedDataKey {
    const version = this.#activeVersions.get(input.purpose);

    if (version === undefined) {
      throw new Error("No active key-encryption key for purpose");
    }

    const keyEntry = this.#keys.get(input.purpose)?.get(version);

    if (!keyEntry || input.plaintextKey.length !== 32) {
      throw new Error("Unable to wrap data key");
    }

    const nonce = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", keyEntry.key, nonce, {
      authTagLength: 16,
    });
    cipher.setAAD(
      wrapAad(input.purpose, input.ownerId, input.dataKeyId, version),
    );
    const ciphertext = Buffer.concat([
      cipher.update(input.plaintextKey),
      cipher.final(),
    ]);

    return {
      formatVersion: 1,
      purpose: input.purpose,
      ownerId: input.ownerId,
      dataKeyId: input.dataKeyId,
      keyId: keyEntry.id,
      keyVersion: version,
      algorithm: "aes-256-gcm",
      nonce: nonce.toString("base64url"),
      ciphertext: ciphertext.toString("base64url"),
      authenticationTag: cipher.getAuthTag().toString("base64url"),
    };
  }

  unwrapDataKey(wrappedKey: WrappedDataKey): Buffer {
    const keyEntry = this.#keys
      .get(wrappedKey.purpose)
      ?.get(wrappedKey.keyVersion);

    if (!keyEntry || keyEntry.id !== wrappedKey.keyId) {
      throw new Error("Data-key unwrap failed");
    }

    try {
      const decipher = createDecipheriv(
        "aes-256-gcm",
        keyEntry.key,
        Buffer.from(wrappedKey.nonce, "base64url"),
        { authTagLength: 16 },
      );
      decipher.setAAD(
        wrapAad(
          wrappedKey.purpose,
          wrappedKey.ownerId,
          wrappedKey.dataKeyId,
          wrappedKey.keyVersion,
        ),
      );
      decipher.setAuthTag(
        Buffer.from(wrappedKey.authenticationTag, "base64url"),
      );
      const key = Buffer.concat([
        decipher.update(Buffer.from(wrappedKey.ciphertext, "base64url")),
        decipher.final(),
      ]);

      if (key.length !== 32) {
        throw new Error("Invalid unwrapped key length");
      }

      return key;
    } catch {
      throw new Error("Data-key unwrap failed");
    }
  }
}

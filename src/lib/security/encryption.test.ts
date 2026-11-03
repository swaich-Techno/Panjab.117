import { randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  canonicalizeAuthenticatedContext,
  createOwnedDataKey,
  decryptText,
  destroyPlaintextDataKey,
  encryptText,
  recoverOwnedDataKey,
  rotateOwnedDataKey,
  type AuthenticatedContext,
  type EncryptedEnvelope,
} from "./encryption";
import { InMemoryKeyProvider } from "./fake-key-provider";

const context: AuthenticatedContext = {
  purpose: "answer",
  ownerId: "synthetic-response-001",
  schema: "panjab_confidential",
  table: "encrypted_answers",
  rowId: "synthetic-answer-001",
  field: "ciphertext",
  surveyVersionId: "synthetic-survey-version-001",
  questionId: "synthetic-question-001",
  attributes: { locale: "pa", schemaVersion: "2b-poc-1" },
};

function providerWithSeparatedKeys(): InMemoryKeyProvider {
  const provider = new InMemoryKeyProvider();
  provider.addKey("answer", 1, Buffer.alloc(32, 0x11));
  provider.addKey("identity", 1, Buffer.alloc(32, 0x22));
  provider.addKey("backup", 1, Buffer.alloc(32, 0x33));
  return provider;
}

describe("development encryption proof of concept", () => {
  it("round-trips AES-256-GCM with canonical authenticated metadata", () => {
    const provider = providerWithSeparatedKeys();
    const dataKey = createOwnedDataKey("answer", context.ownerId, provider);
    const envelope = encryptText("synthetic-answer-value", context, dataKey);

    expect(envelope.formatVersion).toBe(1);
    expect(envelope.algorithm).toBe("aes-256-gcm");
    expect(Buffer.from(envelope.nonce, "base64url")).toHaveLength(12);
    expect(Buffer.from(envelope.authenticationTag, "base64url")).toHaveLength(
      16,
    );
    expect(decryptText(envelope, context, dataKey.wrappedKey, provider)).toBe(
      "synthetic-answer-value",
    );
    destroyPlaintextDataKey(dataKey);
  });

  it("canonicalizes attributes independently of insertion order", () => {
    const left = canonicalizeAuthenticatedContext({
      ...context,
      attributes: { alpha: "1", beta: "2" },
    });
    const right = canonicalizeAuthenticatedContext({
      ...context,
      attributes: { beta: "2", alpha: "1" },
    });

    expect(left.equals(right)).toBe(true);
    expect(() =>
      canonicalizeAuthenticatedContext({
        ...context,
        attributes: { purpose: "collision" },
      }),
    ).toThrow("Invalid authenticated metadata attribute name");
  });

  it("fails closed for altered ciphertext, tag, nonce, metadata, and owner", () => {
    const provider = providerWithSeparatedKeys();
    const dataKey = createOwnedDataKey("answer", context.ownerId, provider);
    const envelope = encryptText("synthetic-answer-value", context, dataKey);
    const mutate = (
      property: "ciphertext" | "authenticationTag" | "nonce",
    ): EncryptedEnvelope => ({
      ...envelope,
      [property]: randomBytes(
        Buffer.from(envelope[property], "base64url").length,
      ).toString("base64url"),
    });

    for (const property of [
      "ciphertext",
      "authenticationTag",
      "nonce",
    ] as const) {
      expect(() =>
        decryptText(mutate(property), context, dataKey.wrappedKey, provider),
      ).toThrow("Authenticated decryption failed");
    }

    expect(() =>
      decryptText(
        envelope,
        { ...context, questionId: "different-question" },
        dataKey.wrappedKey,
        provider,
      ),
    ).toThrow("Authenticated decryption failed");
    expect(() =>
      decryptText(
        envelope,
        { ...context, ownerId: "different-response" },
        dataKey.wrappedKey,
        provider,
      ),
    ).toThrow("Authenticated decryption failed");
    destroyPlaintextDataKey(dataKey);
  });

  it("keeps answer and identity key hierarchies non-interchangeable", () => {
    const provider = providerWithSeparatedKeys();
    const answerKey = createOwnedDataKey("answer", context.ownerId, provider);
    const identityKey = createOwnedDataKey(
      "identity",
      context.ownerId,
      provider,
    );
    const envelope = encryptText("synthetic-answer-value", context, answerKey);

    expect(() =>
      decryptText(envelope, context, identityKey.wrappedKey, provider),
    ).toThrow("Authenticated decryption failed");
    destroyPlaintextDataKey(answerKey);
    destroyPlaintextDataKey(identityKey);
  });

  it("rotates the KEK wrapper without changing ciphertext", () => {
    const provider = providerWithSeparatedKeys();
    const dataKey = createOwnedDataKey("answer", context.ownerId, provider);
    const envelope = encryptText("synthetic-answer-value", context, dataKey);
    provider.addKey("answer", 2, Buffer.alloc(32, 0x44));
    const rotated = rotateOwnedDataKey(dataKey.wrappedKey, provider);

    expect(rotated.keyVersion).toBe(2);
    expect(rotated.dataKeyId).toBe(dataKey.id);
    expect(decryptText(envelope, context, rotated, provider)).toBe(
      "synthetic-answer-value",
    );
    destroyPlaintextDataKey(dataKey);
  });

  it("recovers with an older decrypt-only key and fails after key removal", () => {
    const provider = providerWithSeparatedKeys();
    const original = createOwnedDataKey("answer", context.ownerId, provider);
    provider.addKey("answer", 2, Buffer.alloc(32, 0x55));
    const recovered = recoverOwnedDataKey(original.wrappedKey, provider);

    expect(recovered.plaintextKey.equals(original.plaintextKey)).toBe(true);
    destroyPlaintextDataKey(recovered);
    provider.removeKey("answer", 1);
    expect(() => recoverOwnedDataKey(original.wrappedKey, provider)).toThrow(
      "Data-key unwrap failed",
    );
    destroyPlaintextDataKey(original);
  });

  it("generates unique 96-bit nonces across a synthetic sample", () => {
    const provider = providerWithSeparatedKeys();
    const dataKey = createOwnedDataKey("answer", context.ownerId, provider);
    const nonces = new Set<string>();

    for (let index = 0; index < 5_000; index += 1) {
      nonces.add(
        encryptText(
          `synthetic-${index}`,
          { ...context, rowId: `${index}` },
          dataKey,
        ).nonce,
      );
    }

    expect(nonces.size).toBe(5_000);
    destroyPlaintextDataKey(dataKey);
  });
});

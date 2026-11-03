import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";

export const ENVELOPE_VERSION = 1 as const;
export const ENCRYPTION_ALGORITHM = "aes-256-gcm" as const;

export type KeyPurpose = "answer" | "identity" | "backup";

export interface AuthenticatedContext {
  purpose: KeyPurpose;
  ownerId: string;
  schema: string;
  table: string;
  rowId: string;
  field: string;
  surveyVersionId?: string;
  questionId?: string;
  attributes?: Readonly<Record<string, string>>;
}

export interface WrappedDataKey {
  formatVersion: 1;
  purpose: KeyPurpose;
  ownerId: string;
  dataKeyId: string;
  keyId: string;
  keyVersion: number;
  algorithm: "aes-256-gcm";
  nonce: string;
  ciphertext: string;
  authenticationTag: string;
}

export interface EncryptedEnvelope {
  formatVersion: 1;
  algorithm: "aes-256-gcm";
  purpose: KeyPurpose;
  ownerId: string;
  dataKeyId: string;
  nonce: string;
  ciphertext: string;
  authenticationTag: string;
  authenticatedContextSha256: string;
}

export interface KeyProvider {
  wrapDataKey(input: {
    purpose: KeyPurpose;
    ownerId: string;
    dataKeyId: string;
    plaintextKey: Buffer;
  }): WrappedDataKey;
  unwrapDataKey(wrappedKey: WrappedDataKey): Buffer;
}

export interface OwnedDataKey {
  id: string;
  purpose: KeyPurpose;
  ownerId: string;
  plaintextKey: Buffer;
  wrappedKey: WrappedDataKey;
}

export class DecryptionError extends Error {
  constructor() {
    super("Authenticated decryption failed");
    this.name = "DecryptionError";
  }
}

function encodePart(value: string): Buffer {
  const encoded = Buffer.from(value, "utf8");

  if (encoded.length > 65_535) {
    throw new RangeError("Authenticated metadata value is too long");
  }

  const length = Buffer.allocUnsafe(2);
  length.writeUInt16BE(encoded.length);
  return Buffer.concat([length, encoded]);
}

export function canonicalizeAuthenticatedContext(
  context: AuthenticatedContext,
): Buffer {
  const requiredEntries: Array<readonly [string, string]> = [
    ["envelopeVersion", String(ENVELOPE_VERSION)],
    ["purpose", context.purpose],
    ["ownerId", context.ownerId],
    ["schema", context.schema],
    ["table", context.table],
    ["rowId", context.rowId],
    ["field", context.field],
    ["surveyVersionId", context.surveyVersionId ?? ""],
    ["questionId", context.questionId ?? ""],
  ];
  const reservedNames = new Set(requiredEntries.map(([name]) => name));
  const attributeEntries = Object.entries(context.attributes ?? {});

  if (attributeEntries.length > 32) {
    throw new RangeError("Too many authenticated metadata attributes");
  }

  for (const [name] of attributeEntries) {
    if (reservedNames.has(name) || !/^[a-z][a-zA-Z0-9]{0,63}$/.test(name)) {
      throw new Error("Invalid authenticated metadata attribute name");
    }
  }

  attributeEntries.sort(([left], [right]) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
  const entries = [...requiredEntries, ...attributeEntries];

  return Buffer.concat(
    entries.flatMap(([name, value]) => [encodePart(name), encodePart(value)]),
  );
}

function decodeFixedLength(value: string, bytes: number): Buffer {
  const decoded = Buffer.from(value, "base64url");

  if (decoded.length !== bytes) {
    throw new DecryptionError();
  }

  return decoded;
}

function assertOwnedContext(
  context: AuthenticatedContext,
  dataKey: Pick<OwnedDataKey, "purpose" | "ownerId">,
): void {
  if (
    context.purpose !== dataKey.purpose ||
    context.ownerId !== dataKey.ownerId
  ) {
    throw new Error("Data-key ownership does not match encryption context");
  }
}

export function createOwnedDataKey(
  purpose: KeyPurpose,
  ownerId: string,
  provider: KeyProvider,
): OwnedDataKey {
  const plaintextKey = randomBytes(32);
  const id = randomUUID();

  return {
    id,
    purpose,
    ownerId,
    plaintextKey,
    wrappedKey: provider.wrapDataKey({
      purpose,
      ownerId,
      dataKeyId: id,
      plaintextKey,
    }),
  };
}

export function recoverOwnedDataKey(
  wrappedKey: WrappedDataKey,
  provider: KeyProvider,
): OwnedDataKey {
  return {
    id: wrappedKey.dataKeyId,
    purpose: wrappedKey.purpose,
    ownerId: wrappedKey.ownerId,
    plaintextKey: provider.unwrapDataKey(wrappedKey),
    wrappedKey,
  };
}

export function rotateOwnedDataKey(
  wrappedKey: WrappedDataKey,
  provider: KeyProvider,
): WrappedDataKey {
  const plaintextKey = provider.unwrapDataKey(wrappedKey);

  try {
    return provider.wrapDataKey({
      purpose: wrappedKey.purpose,
      ownerId: wrappedKey.ownerId,
      dataKeyId: wrappedKey.dataKeyId,
      plaintextKey,
    });
  } finally {
    plaintextKey.fill(0);
  }
}

export function destroyPlaintextDataKey(dataKey: OwnedDataKey): void {
  dataKey.plaintextKey.fill(0);
}

export function encryptBuffer(
  plaintext: Buffer,
  context: AuthenticatedContext,
  dataKey: OwnedDataKey,
): EncryptedEnvelope {
  assertOwnedContext(context, dataKey);

  if (dataKey.plaintextKey.length !== 32) {
    throw new Error("AES-256-GCM requires a 256-bit data key");
  }

  const nonce = randomBytes(12);
  const authenticatedContext = canonicalizeAuthenticatedContext(context);
  const cipher = createCipheriv(
    ENCRYPTION_ALGORITHM,
    dataKey.plaintextKey,
    nonce,
    { authTagLength: 16 },
  );
  cipher.setAAD(authenticatedContext);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authenticationTag = cipher.getAuthTag();

  return {
    formatVersion: ENVELOPE_VERSION,
    algorithm: ENCRYPTION_ALGORITHM,
    purpose: context.purpose,
    ownerId: context.ownerId,
    dataKeyId: dataKey.id,
    nonce: nonce.toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
    authenticationTag: authenticationTag.toString("base64url"),
    authenticatedContextSha256: createHash("sha256")
      .update(authenticatedContext)
      .digest("base64url"),
  };
}

export function encryptText(
  plaintext: string,
  context: AuthenticatedContext,
  dataKey: OwnedDataKey,
): EncryptedEnvelope {
  return encryptBuffer(Buffer.from(plaintext, "utf8"), context, dataKey);
}

export function decryptBuffer(
  envelope: EncryptedEnvelope,
  context: AuthenticatedContext,
  wrappedKey: WrappedDataKey,
  provider: KeyProvider,
): Buffer {
  try {
    if (
      envelope.formatVersion !== ENVELOPE_VERSION ||
      envelope.algorithm !== ENCRYPTION_ALGORITHM ||
      envelope.purpose !== context.purpose ||
      envelope.ownerId !== context.ownerId ||
      envelope.dataKeyId !== wrappedKey.dataKeyId ||
      wrappedKey.purpose !== context.purpose ||
      wrappedKey.ownerId !== context.ownerId
    ) {
      throw new DecryptionError();
    }

    const authenticatedContext = canonicalizeAuthenticatedContext(context);
    const expectedContextDigest = createHash("sha256")
      .update(authenticatedContext)
      .digest();
    const suppliedContextDigest = decodeFixedLength(
      envelope.authenticatedContextSha256,
      32,
    );

    if (!timingSafeEqual(expectedContextDigest, suppliedContextDigest)) {
      throw new DecryptionError();
    }

    const plaintextKey = provider.unwrapDataKey(wrappedKey);

    try {
      const decipher = createDecipheriv(
        ENCRYPTION_ALGORITHM,
        plaintextKey,
        decodeFixedLength(envelope.nonce, 12),
        { authTagLength: 16 },
      );
      decipher.setAAD(authenticatedContext);
      decipher.setAuthTag(decodeFixedLength(envelope.authenticationTag, 16));
      return Buffer.concat([
        decipher.update(Buffer.from(envelope.ciphertext, "base64url")),
        decipher.final(),
      ]);
    } finally {
      plaintextKey.fill(0);
    }
  } catch {
    throw new DecryptionError();
  }
}

export function decryptText(
  envelope: EncryptedEnvelope,
  context: AuthenticatedContext,
  wrappedKey: WrappedDataKey,
  provider: KeyProvider,
): string {
  return decryptBuffer(envelope, context, wrappedKey, provider).toString(
    "utf8",
  );
}

import { createHmac, timingSafeEqual } from "node:crypto";

export type RiskFlag = {
  code: "replayed_idempotency_key" | "duplicate_payload" | "rate_limited";
  explanation: string;
  severity: "low" | "medium" | "high";
};

export type DuplicateScreeningInput = {
  idempotencyKey: string;
  surveyVersionId: string;
  constituencyNumber: number;
  canonicalAnswerPayload: string;
  privacyScopeToken: string;
};

export type ScreeningSignalKey = {
  id: string;
  key: Buffer;
  status: "active" | "retained_for_duplicate_window";
};

type DerivedSignal = { keyId: string; value: string };

function encodePart(value: string): Buffer {
  const encoded = Buffer.from(value, "utf8");
  const length = Buffer.allocUnsafe(4);
  length.writeUInt32BE(encoded.length);
  return Buffer.concat([length, encoded]);
}

function canonicalSignalInput(
  domain: string,
  parts: readonly string[],
): Buffer {
  return Buffer.concat([encodePart(domain), ...parts.map(encodePart)]);
}

export class ScreeningKeyRing {
  readonly #keys: readonly ScreeningSignalKey[];
  readonly #activeKey: ScreeningSignalKey;

  constructor(keys: readonly ScreeningSignalKey[]) {
    if (
      keys.length === 0 ||
      new Set(keys.map(({ id }) => id)).size !== keys.length
    ) {
      throw new Error("Screening key IDs must be present and unique");
    }

    if (keys.some(({ key }) => key.length < 32)) {
      throw new Error("Screening HMAC keys must be at least 256 bits");
    }

    const activeKeys = keys.filter(({ status }) => status === "active");
    if (activeKeys.length !== 1) {
      throw new Error("Exactly one screening key must be active");
    }

    this.#keys = keys.map((entry) => ({
      ...entry,
      key: Buffer.from(entry.key),
    }));
    this.#activeKey = this.#keys.find(({ status }) => status === "active")!;
  }

  deriveAll(
    domain: string,
    parts: readonly string[],
  ): readonly DerivedSignal[] {
    const input = canonicalSignalInput(domain, parts);
    return this.#keys.map(({ id, key }) => ({
      keyId: id,
      value: createHmac("sha256", key).update(input).digest("base64url"),
    }));
  }

  deriveActive(domain: string, parts: readonly string[]): DerivedSignal {
    const input = canonicalSignalInput(domain, parts);
    return {
      keyId: this.#activeKey.id,
      value: createHmac("sha256", this.#activeKey.key)
        .update(input)
        .digest("base64url"),
    };
  }
}

export interface AtomicSignalStore {
  /** Atomically claims every supplied rotation-equivalent signal or none. */
  claimAny(signals: readonly string[]): Promise<{ claimed: boolean }>;
}

export interface RateLimiter {
  check(
    scopeSignal: string,
  ): Promise<{ allowed: boolean; retryAfterMs?: number }>;
}

export type PrivacySafeLogEvent = {
  event: "survey_screened";
  flagCodes: RiskFlag["code"][];
  idempotencySignalPrefix: string;
  signalKeyId: string;
};

export type DuplicateScreeningResult = {
  acceptedForReview: boolean;
  automaticallyDeleted: false;
  flags: RiskFlag[];
  review: {
    required: boolean;
    appealAvailable: true;
  };
  logEvent: PrivacySafeLogEvent;
};

function storeValues(signals: readonly DerivedSignal[]): string[] {
  return signals.map(({ keyId, value }) => `${keyId}:${value}`);
}

export async function screenSyntheticSubmission(
  input: DuplicateScreeningInput,
  dependencies: {
    keyRing: ScreeningKeyRing;
    idempotencyStore: AtomicSignalStore;
    duplicateStore: AtomicSignalStore;
    rateLimiter: RateLimiter;
  },
): Promise<DuplicateScreeningResult> {
  const flags: RiskFlag[] = [];
  const activeIdempotencySignal = dependencies.keyRing.deriveActive(
    "idempotency",
    [input.surveyVersionId, input.idempotencyKey],
  );
  const rateSignal = dependencies.keyRing.deriveActive("rate_limit", [
    input.surveyVersionId,
    input.privacyScopeToken,
  ]);
  const rateResult = await dependencies.rateLimiter.check(
    `${rateSignal.keyId}:${rateSignal.value}`,
  );
  if (!rateResult.allowed) {
    flags.push({
      code: "rate_limited",
      severity: "medium",
      explanation:
        "The privacy-scoped synthetic submission budget was exceeded.",
    });
  } else {
    const idempotencySignals = dependencies.keyRing.deriveAll("idempotency", [
      input.surveyVersionId,
      input.idempotencyKey,
    ]);
    const idempotencyClaim = await dependencies.idempotencyStore.claimAny(
      storeValues(idempotencySignals),
    );

    if (!idempotencyClaim.claimed) {
      flags.push({
        code: "replayed_idempotency_key",
        severity: "high",
        explanation:
          "This survey-version-scoped idempotency signal was already claimed.",
      });
    } else {
      const payloadSignals = dependencies.keyRing.deriveAll(
        "answer_duplicate",
        [
          input.surveyVersionId,
          String(input.constituencyNumber),
          input.canonicalAnswerPayload,
        ],
      );
      const payloadClaim = await dependencies.duplicateStore.claimAny(
        storeValues(payloadSignals),
      );

      if (!payloadClaim.claimed) {
        flags.push({
          code: "duplicate_payload",
          severity: "medium",
          explanation:
            "A keyed signal for the normalized synthetic answers matches an earlier response in this survey version and segment.",
        });
      }
    }
  }

  return {
    acceptedForReview: flags.length === 0,
    automaticallyDeleted: false,
    flags,
    review: {
      required: flags.length > 0,
      appealAvailable: true,
    },
    logEvent: {
      event: "survey_screened",
      flagCodes: flags.map(({ code }) => code),
      idempotencySignalPrefix: activeIdempotencySignal.value.slice(0, 12),
      signalKeyId: activeIdempotencySignal.keyId,
    },
  };
}

/**
 * Development-only store. `claimAny` has no await between inspection and write,
 * so concurrent calls in one JavaScript process cannot interleave the critical
 * section. Production requires one transactional database operation.
 */
export class InMemoryAtomicSignalStore implements AtomicSignalStore {
  readonly #signals = new Set<string>();

  async claimAny(signals: readonly string[]): Promise<{ claimed: boolean }> {
    if (signals.length === 0 || new Set(signals).size !== signals.length) {
      throw new Error("Atomic signal claim requires unique candidate signals");
    }

    if (signals.some((candidate) => this.#signals.has(candidate))) {
      return { claimed: false };
    }

    for (const candidate of signals) {
      this.#signals.add(candidate);
    }
    return { claimed: true };
  }

  has(candidate: string): boolean {
    for (const stored of this.#signals) {
      const left = Buffer.from(stored);
      const right = Buffer.from(candidate);
      if (left.length === right.length && timingSafeEqual(left, right)) {
        return true;
      }
    }
    return false;
  }
}

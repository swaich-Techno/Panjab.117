import { createHash } from "node:crypto";

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

export interface IdempotencyStore {
  claim(keyDigest: string): Promise<boolean>;
}

export interface DuplicateDigestStore {
  has(digest: string): Promise<boolean>;
  add(digest: string): Promise<void>;
}

export interface RateLimiter {
  check(
    scopeDigest: string,
  ): Promise<{ allowed: boolean; retryAfterMs?: number }>;
}

export type PrivacySafeLogEvent = {
  event: "survey_screened";
  flagCodes: RiskFlag["code"][];
  idempotencyKeyDigestPrefix: string;
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

function digest(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export async function screenSyntheticSubmission(
  input: DuplicateScreeningInput,
  dependencies: {
    idempotencyStore: IdempotencyStore;
    duplicateStore: DuplicateDigestStore;
    rateLimiter: RateLimiter;
  },
): Promise<DuplicateScreeningResult> {
  const flags: RiskFlag[] = [];
  const idempotencyDigest = digest(input.idempotencyKey);
  const isNewIdempotencyKey =
    await dependencies.idempotencyStore.claim(idempotencyDigest);

  if (!isNewIdempotencyKey) {
    flags.push({
      code: "replayed_idempotency_key",
      severity: "high",
      explanation: "The same idempotency key was already claimed.",
    });
  }

  const payloadDigest = digest(
    [
      input.surveyVersionId,
      input.constituencyNumber,
      input.canonicalAnswerPayload,
    ].join("\u001f"),
  );

  if (await dependencies.duplicateStore.has(payloadDigest)) {
    flags.push({
      code: "duplicate_payload",
      severity: "medium",
      explanation:
        "The normalized synthetic answer payload matches an earlier payload.",
    });
  } else {
    await dependencies.duplicateStore.add(payloadDigest);
  }

  const rateResult = await dependencies.rateLimiter.check(
    digest(input.privacyScopeToken),
  );
  if (!rateResult.allowed) {
    flags.push({
      code: "rate_limited",
      severity: "medium",
      explanation: "The privacy-scoped submission budget was exceeded.",
    });
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
      idempotencyKeyDigestPrefix: idempotencyDigest.slice(0, 12),
    },
  };
}

export class InMemoryClaimStore implements IdempotencyStore {
  private readonly claims = new Set<string>();

  async claim(keyDigest: string): Promise<boolean> {
    if (this.claims.has(keyDigest)) return false;
    this.claims.add(keyDigest);
    return true;
  }
}

export class InMemoryDigestStore implements DuplicateDigestStore {
  private readonly digests = new Set<string>();

  async has(value: string): Promise<boolean> {
    return this.digests.has(value);
  }

  async add(value: string): Promise<void> {
    this.digests.add(value);
  }
}

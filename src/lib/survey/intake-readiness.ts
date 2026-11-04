import { createHmac, timingSafeEqual } from "node:crypto";

import { isLocale, type Locale } from "@/lib/i18n";

import { CONSENT_NOTICE_DIGEST, CONSENT_NOTICE_VERSION } from "./consent";
import {
  fatehgarhSahibQuestionnaire,
  QUESTIONNAIRE_VERSION,
  type SurveyQuestion,
} from "./questionnaire";
import { ScreeningKeyRing } from "./duplicate-screening";

type AnswerValue = string | readonly string[];

export type ValidatedSyntheticSubmission = {
  questionnaireVersion: typeof QUESTIONNAIRE_VERSION;
  locale: Locale;
  idempotencyKey: string;
  privacyScopeToken: string;
  minimumAgeConfirmed: true;
  consent: {
    civicParticipation: true;
    politicalOpinion: boolean;
    noticeVersion: typeof CONSENT_NOTICE_VERSION;
    noticeDigest: typeof CONSENT_NOTICE_DIGEST;
  };
  answers: Readonly<Record<string, AnswerValue>>;
  politicalAnswers: Readonly<Record<string, AnswerValue>>;
};

export class IntakeValidationError extends Error {
  constructor(readonly issues: readonly string[]) {
    super(`Synthetic intake validation failed: ${issues.join("; ")}`);
    this.name = "IntakeValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordAt(
  value: unknown,
  path: string,
  issues: string[],
): Record<string, unknown> | null {
  if (!isRecord(value)) {
    issues.push(`${path} must be an object`);
    return null;
  }
  return value;
}

function rejectUnknownKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  issues: string[],
): void {
  const allowedKeys = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) issues.push(`${path}.${key} is not permitted`);
  }
}

function validateOpaqueToken(
  value: unknown,
  path: string,
  issues: string[],
): string {
  if (
    typeof value !== "string" ||
    value.length < 16 ||
    value.length > 128 ||
    !/^[A-Za-z0-9_-]+$/u.test(value)
  ) {
    issues.push(`${path} must be a 16-128 character URL-safe opaque token`);
    return "";
  }
  return value;
}

function validateAnswerSet(
  value: unknown,
  questions: readonly SurveyQuestion[],
  path: string,
  issues: string[],
): Record<string, AnswerValue> {
  const record = recordAt(value, path, issues);
  if (!record) return {};
  rejectUnknownKeys(
    record,
    questions.map(({ id }) => id),
    path,
    issues,
  );

  const validated: Record<string, AnswerValue> = {};
  for (const question of questions) {
    const answer = record[question.id];
    if (answer === undefined) {
      if (question.required) issues.push(`${path}.${question.id} is required`);
      continue;
    }
    const allowedOptions = new Set(question.options.map(({ id }) => id));
    if (question.responseType === "single_choice") {
      if (typeof answer !== "string" || !allowedOptions.has(answer)) {
        issues.push(`${path}.${question.id} is not an allowed option`);
      } else {
        validated[question.id] = answer;
      }
      continue;
    }
    if (
      !Array.isArray(answer) ||
      answer.length === 0 ||
      answer.length > 3 ||
      answer.some((item) => typeof item !== "string") ||
      new Set(answer).size !== answer.length ||
      answer.some((item) => !allowedOptions.has(String(item)))
    ) {
      issues.push(
        `${path}.${question.id} must contain one to three unique allowed options`,
      );
    } else {
      validated[question.id] = answer as string[];
    }
  }
  return validated;
}

export function validateSyntheticSubmission(
  value: unknown,
): ValidatedSyntheticSubmission {
  const issues: string[] = [];
  const input = recordAt(value, "submission", issues);
  if (!input) throw new IntakeValidationError(issues);
  rejectUnknownKeys(
    input,
    [
      "questionnaireVersion",
      "locale",
      "idempotencyKey",
      "privacyScopeToken",
      "minimumAgeConfirmed",
      "consent",
      "answers",
      "politicalAnswers",
    ],
    "submission",
    issues,
  );

  if (input.questionnaireVersion !== QUESTIONNAIRE_VERSION) {
    issues.push("submission.questionnaireVersion is unsupported");
  }
  const locale =
    typeof input.locale === "string" && isLocale(input.locale)
      ? input.locale
      : null;
  if (!locale) issues.push("submission.locale is unsupported");
  if (input.minimumAgeConfirmed !== true) {
    issues.push("submission.minimumAgeConfirmed must be true");
  }

  const consent = recordAt(input.consent, "submission.consent", issues);
  if (consent) {
    rejectUnknownKeys(
      consent,
      [
        "civicParticipation",
        "politicalOpinion",
        "noticeVersion",
        "noticeDigest",
      ],
      "submission.consent",
      issues,
    );
    if (consent.civicParticipation !== true) {
      issues.push("submission.consent.civicParticipation must be true");
    }
    if (typeof consent.politicalOpinion !== "boolean") {
      issues.push("submission.consent.politicalOpinion must be boolean");
    }
    if (consent.noticeVersion !== CONSENT_NOTICE_VERSION) {
      issues.push("submission.consent.noticeVersion is unsupported");
    }
    if (consent.noticeDigest !== CONSENT_NOTICE_DIGEST) {
      issues.push("submission.consent.noticeDigest does not match the notice");
    }
  }

  const civicQuestions: readonly SurveyQuestion[] =
    fatehgarhSahibQuestionnaire.questions.filter(
      ({ politicalOpinion }) => !politicalOpinion,
    );
  const politicalQuestions: readonly SurveyQuestion[] =
    fatehgarhSahibQuestionnaire.questions.filter(
      ({ politicalOpinion }) => politicalOpinion,
    );
  const answers = validateAnswerSet(
    input.answers,
    civicQuestions,
    "submission.answers",
    issues,
  );
  const politicalAnswers = validateAnswerSet(
    input.politicalAnswers,
    politicalQuestions,
    "submission.politicalAnswers",
    issues,
  );
  const politicalConsent = consent?.politicalOpinion === true;
  if (!politicalConsent && Object.keys(politicalAnswers).length > 0) {
    issues.push(
      "submission.politicalAnswers requires separate political-opinion consent",
    );
  }

  const idempotencyKey = validateOpaqueToken(
    input.idempotencyKey,
    "submission.idempotencyKey",
    issues,
  );
  const privacyScopeToken = validateOpaqueToken(
    input.privacyScopeToken,
    "submission.privacyScopeToken",
    issues,
  );

  if (issues.length > 0) throw new IntakeValidationError(issues);

  return {
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    locale: locale!,
    idempotencyKey,
    privacyScopeToken,
    minimumAgeConfirmed: true,
    consent: {
      civicParticipation: true,
      politicalOpinion: politicalConsent,
      noticeVersion: CONSENT_NOTICE_VERSION,
      noticeDigest: CONSENT_NOTICE_DIGEST,
    },
    answers,
    politicalAnswers,
  };
}

export type SyntheticCsrfProof = {
  keyId: string;
  origin: string;
  cookieToken: string;
  headerToken: string;
  issuedAt: string;
  signature: string;
};

function csrfPayload(proof: Omit<SyntheticCsrfProof, "signature">): string {
  return JSON.stringify([
    QUESTIONNAIRE_VERSION,
    proof.keyId,
    proof.origin,
    proof.cookieToken,
    proof.issuedAt,
  ]);
}

export function createSyntheticCsrfProof(
  input: Omit<SyntheticCsrfProof, "signature" | "headerToken">,
  syntheticHmacKey: Buffer,
): SyntheticCsrfProof {
  if (syntheticHmacKey.length < 32) {
    throw new Error("CSRF HMAC key must be at least 256 bits");
  }
  const unsigned = { ...input, headerToken: input.cookieToken };
  return {
    ...unsigned,
    signature: createHmac("sha256", syntheticHmacKey)
      .update(csrfPayload(unsigned), "utf8")
      .digest("base64url"),
  };
}

export function validateSyntheticCsrfProof(
  proof: SyntheticCsrfProof,
  options: {
    expectedOrigin: string;
    syntheticHmacKey: Buffer;
    now: Date;
    maxAgeMs?: number;
  },
): void {
  if (options.syntheticHmacKey.length < 32) {
    throw new Error("CSRF HMAC key must be at least 256 bits");
  }
  if (proof.origin !== options.expectedOrigin) {
    throw new Error("CSRF origin mismatch");
  }
  if (!/^[A-Za-z0-9_-]{1,64}$/u.test(proof.keyId)) {
    throw new Error("CSRF key ID is invalid");
  }
  if (
    !/^[A-Za-z0-9_-]{32,128}$/u.test(proof.cookieToken) ||
    proof.cookieToken !== proof.headerToken
  ) {
    throw new Error("CSRF token mismatch");
  }
  const issuedAt = Date.parse(proof.issuedAt);
  const maxAgeMs = options.maxAgeMs ?? 2 * 60 * 60 * 1000;
  const age = options.now.getTime() - issuedAt;
  if (!Number.isFinite(issuedAt) || age < 0 || age > maxAgeMs) {
    throw new Error("CSRF proof is expired or not yet valid");
  }
  const expected = createHmac("sha256", options.syntheticHmacKey)
    .update(
      csrfPayload({
        keyId: proof.keyId,
        origin: proof.origin,
        cookieToken: proof.cookieToken,
        headerToken: proof.headerToken,
        issuedAt: proof.issuedAt,
      }),
      "utf8",
    )
    .digest();
  const supplied = Buffer.from(proof.signature, "base64url");
  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  ) {
    throw new Error("CSRF signature mismatch");
  }
}

export type AtomicIntakeClaim = {
  responseId: string;
  idempotencySignals: readonly string[];
  payloadSignals: readonly string[];
  rateSignals: readonly string[];
  rateLimit: number;
};

export type AtomicIntakeOutcome = {
  status: "accepted" | "replay" | "duplicate" | "rate_limited";
  storedForHumanReview: boolean;
  acceptedForAnalysis: boolean;
  automaticallyDeleted: false;
};

type AtomicState = {
  idempotencySignals: Set<string>;
  payloadSignals: Set<string>;
  responseIds: Set<string>;
  rateCounts: Map<string, number>;
};

function cloneState(state: AtomicState): AtomicState {
  return {
    idempotencySignals: new Set(state.idempotencySignals),
    payloadSignals: new Set(state.payloadSignals),
    responseIds: new Set(state.responseIds),
    rateCounts: new Map(state.rateCounts),
  };
}

function assertUniqueSignals(signals: readonly string[], label: string): void {
  if (signals.length === 0 || new Set(signals).size !== signals.length) {
    throw new Error(`${label} must contain unique candidate signals`);
  }
}

export class InMemoryAtomicIntakeStore {
  #state: AtomicState = {
    idempotencySignals: new Set(),
    payloadSignals: new Set(),
    responseIds: new Set(),
    rateCounts: new Map(),
  };

  constructor(
    private readonly beforeCommit?: (outcome: AtomicIntakeOutcome) => void,
  ) {}

  async claim(claim: AtomicIntakeClaim): Promise<AtomicIntakeOutcome> {
    assertUniqueSignals(claim.idempotencySignals, "idempotencySignals");
    assertUniqueSignals(claim.payloadSignals, "payloadSignals");
    assertUniqueSignals(claim.rateSignals, "rateSignals");
    if (!Number.isInteger(claim.rateLimit) || claim.rateLimit < 1) {
      throw new Error("rateLimit must be a positive integer");
    }
    if (this.#state.responseIds.has(claim.responseId)) {
      throw new Error("responseId must be unique");
    }

    const currentRate = Math.max(
      0,
      ...claim.rateSignals.map(
        (signal) => this.#state.rateCounts.get(signal) ?? 0,
      ),
    );
    if (currentRate >= claim.rateLimit) {
      return {
        status: "rate_limited",
        storedForHumanReview: false,
        acceptedForAnalysis: false,
        automaticallyDeleted: false,
      };
    }

    const next = cloneState(this.#state);
    for (const signal of claim.rateSignals) {
      next.rateCounts.set(signal, currentRate + 1);
    }

    let outcome: AtomicIntakeOutcome;
    if (
      claim.idempotencySignals.some((signal) =>
        this.#state.idempotencySignals.has(signal),
      )
    ) {
      outcome = {
        status: "replay",
        storedForHumanReview: false,
        acceptedForAnalysis: false,
        automaticallyDeleted: false,
      };
    } else {
      const duplicate = claim.payloadSignals.some((signal) =>
        this.#state.payloadSignals.has(signal),
      );
      claim.idempotencySignals.forEach((signal) =>
        next.idempotencySignals.add(signal),
      );
      if (!duplicate) {
        claim.payloadSignals.forEach((signal) =>
          next.payloadSignals.add(signal),
        );
      }
      next.responseIds.add(claim.responseId);
      outcome = {
        status: duplicate ? "duplicate" : "accepted",
        storedForHumanReview: true,
        acceptedForAnalysis: !duplicate,
        automaticallyDeleted: false,
      };
    }

    this.beforeCommit?.(outcome);
    this.#state = next;
    return outcome;
  }

  snapshot(): {
    idempotencySignals: number;
    payloadSignals: number;
    responseIds: number;
    rateSignals: number;
  } {
    return {
      idempotencySignals: this.#state.idempotencySignals.size,
      payloadSignals: this.#state.payloadSignals.size,
      responseIds: this.#state.responseIds.size,
      rateSignals: this.#state.rateCounts.size,
    };
  }
}

function serializedSignals(
  keyRing: ScreeningKeyRing,
  domain: string,
  parts: readonly string[],
): string[] {
  return keyRing
    .deriveAll(domain, parts)
    .map(({ keyId, value }) => `${keyId}:${value}`);
}

function canonicalAnswers(submission: ValidatedSyntheticSubmission): string {
  const ordered = fatehgarhSahibQuestionnaire.questions.flatMap((question) => {
    const source = question.politicalOpinion
      ? submission.politicalAnswers
      : submission.answers;
    const answer = source[question.id];
    return answer === undefined ? [] : [[question.id, answer] as const];
  });
  return JSON.stringify({
    politicalConsent: submission.consent.politicalOpinion,
    answers: Object.fromEntries(ordered),
  });
}

export function buildSyntheticAtomicClaim(
  submission: ValidatedSyntheticSubmission,
  options: {
    responseId: string;
    keyRing: ScreeningKeyRing;
    rateLimit: number;
  },
): AtomicIntakeClaim {
  const segment = submission.answers.assembly_segment;
  if (typeof segment !== "string") {
    throw new Error("Validated submission is missing assembly_segment");
  }
  return {
    responseId: options.responseId,
    idempotencySignals: serializedSignals(options.keyRing, "idempotency", [
      submission.questionnaireVersion,
      submission.idempotencyKey,
    ]),
    payloadSignals: serializedSignals(options.keyRing, "answer_duplicate", [
      submission.questionnaireVersion,
      segment,
      canonicalAnswers(submission),
    ]),
    rateSignals: serializedSignals(options.keyRing, "rate_limit", [
      submission.questionnaireVersion,
      submission.privacyScopeToken,
    ]),
    rateLimit: options.rateLimit,
  };
}

import { MAX_INTAKE_BODY_BYTES, SafeIntakeError } from "./secure-intake";
import type {
  OperationalApprovalDomain,
  ProductionLaunchEvidenceProvider,
  ProductionLaunchEvidence,
} from "./launch-authorization";
import {
  assertProductionLaunchEvidence,
  currentCollectionControls,
  operationalApprovalDomains,
} from "./launch-authorization";
import type { SyntheticCsrfProof } from "./intake-readiness";
import type { SecureIntakeReceipt } from "./secure-intake";

export type IntakeTransportRequest = {
  method: string;
  protocol: "https:" | "http:";
  origin: string | null;
  contentType: string | null;
  contentLength: string | null;
  secFetchSite: string | null;
  csrfCookieToken: string | null;
  headers: Readonly<Record<string, string | undefined>>;
  body: string;
  receivedAt: Date;
  correlationId: string;
};

export type IntakeTransportResponse = {
  status: number;
  headers: Readonly<Record<string, string>>;
  body: string;
};

export type SafeTransportAuditEvent = {
  event: "survey_intake_request";
  correlationId: string;
  occurredAt: string;
  outcome: "accepted" | "rejected";
  reason:
    | "accepted"
    | "preflight"
    | "method"
    | "transport"
    | "origin"
    | "content_type"
    | "body_size"
    | "csrf"
    | "collection_disabled"
    | "age_policy_unapproved"
    | "request_not_trusted"
    | "invalid_request"
    | "service_unavailable";
};

type SubmitPort = (
  body: string,
  request: {
    origin: string;
    csrfProof: SyntheticCsrfProof;
    now: Date;
  },
) => Promise<SecureIntakeReceipt>;

const baseHeaders = {
  "cache-control": "no-store, max-age=0",
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
} as const;

function assertExpectedOrigin(value: string): void {
  const parsed = new URL(value);
  if (
    parsed.protocol !== "https:" ||
    parsed.origin !== value ||
    parsed.username !== "" ||
    parsed.password !== ""
  ) {
    throw new Error("Expected Origin must be a canonical HTTPS origin");
  }
}

function response(
  status: number,
  body: object,
  expectedOrigin: string,
  requestOrigin: string | null,
): IntakeTransportResponse {
  return {
    status,
    headers: {
      ...baseHeaders,
      ...(requestOrigin === expectedOrigin
        ? {
            "access-control-allow-origin": expectedOrigin,
            "access-control-allow-credentials": "true",
            vary: "Origin",
          }
        : {}),
    },
    body: JSON.stringify(body),
  };
}

function csrfProof(request: IntakeTransportRequest): SyntheticCsrfProof | null {
  const keyId = request.headers["x-p117-csrf-key-id"];
  const headerToken = request.headers["x-p117-csrf-token"];
  const issuedAt = request.headers["x-p117-csrf-issued-at"];
  const signature = request.headers["x-p117-csrf-signature"];
  if (
    request.origin === null ||
    request.csrfCookieToken === null ||
    !keyId ||
    !headerToken ||
    !issuedAt ||
    !signature
  ) {
    return null;
  }
  return {
    keyId,
    origin: request.origin,
    cookieToken: request.csrfCookieToken,
    headerToken,
    issuedAt,
    signature,
  };
}

function parsedContentLength(value: string | null): number | null {
  if (value === null) return null;
  if (!/^(?:0|[1-9][0-9]{0,8})$/u.test(value)) return Number.NaN;
  return Number(value);
}

function publicErrorStatus(code: SafeIntakeError["code"]): number {
  if (code === "invalid_request") return 400;
  if (code === "request_not_trusted") return 403;
  return 503;
}

export function createIntakeHttpHandler(input: {
  expectedOrigin: string;
  submit: SubmitPort;
  audit: (event: SafeTransportAuditEvent) => void;
}) {
  assertExpectedOrigin(input.expectedOrigin);
  return async function handle(
    request: IntakeTransportRequest,
  ): Promise<IntakeTransportResponse> {
    let reason: SafeTransportAuditEvent["reason"] = "invalid_request";
    const receivedAtValid = Number.isFinite(request.receivedAt.getTime());
    const safeCorrelationId = /^[A-Za-z0-9_-]{8,128}$/u.test(
      request.correlationId,
    )
      ? request.correlationId
      : "invalid-correlation-id";
    try {
      if (request.method === "OPTIONS") {
        const requestedMethod =
          request.headers["access-control-request-method"];
        const requestedHeaders = new Set(
          (request.headers["access-control-request-headers"] ?? "")
            .split(",")
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean),
        );
        const allowedHeaders = new Set([
          "content-type",
          "x-p117-csrf-key-id",
          "x-p117-csrf-token",
          "x-p117-csrf-issued-at",
          "x-p117-csrf-signature",
        ]);
        if (
          request.protocol !== "https:" ||
          request.origin !== input.expectedOrigin ||
          !["same-origin", "same-site"].includes(request.secFetchSite ?? "") ||
          requestedMethod !== "POST" ||
          requestedHeaders.size === 0 ||
          [...requestedHeaders].some((header) => !allowedHeaders.has(header))
        ) {
          reason = "origin";
          return response(
            403,
            { error: "The request could not be accepted." },
            input.expectedOrigin,
            request.origin,
          );
        }
        reason = "preflight";
        return {
          status: 204,
          headers: {
            "access-control-allow-origin": input.expectedOrigin,
            "access-control-allow-credentials": "true",
            "access-control-allow-methods": "POST",
            "access-control-allow-headers": [...allowedHeaders].join(", "),
            "access-control-max-age": "600",
            "cache-control": "no-store, max-age=0",
            vary: "Origin",
          },
          body: "",
        };
      }
      if (request.method !== "POST") {
        reason = "method";
        return {
          ...response(
            405,
            { error: "The request could not be accepted." },
            input.expectedOrigin,
            request.origin,
          ),
          headers: { ...baseHeaders, allow: "POST" },
        };
      }
      if (request.protocol !== "https:") {
        reason = "transport";
        return response(
          400,
          { error: "The request could not be accepted." },
          input.expectedOrigin,
          request.origin,
        );
      }
      if (!receivedAtValid) {
        reason = "invalid_request";
        return response(
          400,
          { error: "The request could not be accepted." },
          input.expectedOrigin,
          request.origin,
        );
      }
      if (
        request.origin !== input.expectedOrigin ||
        !["same-origin", "same-site"].includes(request.secFetchSite ?? "")
      ) {
        reason = "origin";
        return response(
          403,
          { error: "The request could not be accepted." },
          input.expectedOrigin,
          request.origin,
        );
      }
      if (
        request.contentType === null ||
        request.contentType.split(";", 1)[0]?.trim().toLowerCase() !==
          "application/json"
      ) {
        reason = "content_type";
        return response(
          415,
          { error: "The request could not be accepted." },
          input.expectedOrigin,
          request.origin,
        );
      }
      const declaredLength = parsedContentLength(request.contentLength);
      if (
        (declaredLength !== null &&
          (!Number.isFinite(declaredLength) ||
            declaredLength > MAX_INTAKE_BODY_BYTES)) ||
        Buffer.byteLength(request.body, "utf8") > MAX_INTAKE_BODY_BYTES
      ) {
        reason = "body_size";
        return response(
          413,
          { error: "The request could not be accepted." },
          input.expectedOrigin,
          request.origin,
        );
      }
      const proof = csrfProof(request);
      if (!proof) {
        reason = "csrf";
        return response(
          403,
          { error: "The request could not be accepted." },
          input.expectedOrigin,
          request.origin,
        );
      }

      const receipt = await input.submit(request.body, {
        origin: request.origin,
        csrfProof: proof,
        now: request.receivedAt,
      });
      reason = "accepted";
      const status =
        receipt.status === "accepted"
          ? 201
          : receipt.status === "duplicate"
            ? 202
            : receipt.status === "rate_limited"
              ? 429
              : 409;
      return response(status, receipt, input.expectedOrigin, request.origin);
    } catch (error) {
      const safe =
        error instanceof SafeIntakeError
          ? error
          : new SafeIntakeError("service_unavailable");
      reason = safe.code;
      return response(
        publicErrorStatus(safe.code),
        { error: safe.publicMessage },
        input.expectedOrigin,
        request.origin,
      );
    } finally {
      input.audit({
        event: "survey_intake_request",
        correlationId: safeCorrelationId,
        occurredAt: receivedAtValid
          ? request.receivedAt.toISOString()
          : "invalid-time",
        outcome:
          reason === "accepted" || reason === "preflight"
            ? "accepted"
            : "rejected",
        reason,
      });
    }
  };
}

export function createProductionIntakeGate(input: {
  expectedOrigin: string;
  deploymentCommitSha: string;
  deploymentImageDigest: string;
  evidenceProvider: ProductionLaunchEvidenceProvider;
  submitApproved: SubmitPort;
  audit: (event: SafeTransportAuditEvent) => void;
  controls?: {
    liveSurveyCollectionEnabled: boolean;
    launchApproved: boolean;
    operationalApprovals: Readonly<Record<OperationalApprovalDomain, boolean>>;
  };
}) {
  const controls = input.controls ?? currentCollectionControls;
  return createIntakeHttpHandler({
    expectedOrigin: input.expectedOrigin,
    audit: input.audit,
    submit: async (body, request) => {
      if (
        !controls.liveSurveyCollectionEnabled ||
        !controls.launchApproved ||
        Object.keys(controls.operationalApprovals).length !==
          operationalApprovalDomains.length ||
        !operationalApprovalDomains.every(
          (domain) => controls.operationalApprovals[domain] === true,
        )
      ) {
        throw new SafeIntakeError("collection_disabled");
      }
      const evidence: ProductionLaunchEvidence | null =
        await input.evidenceProvider.readVerifiedEvidence();
      assertProductionLaunchEvidence(evidence, {
        now: request.now,
        deploymentCommitSha: input.deploymentCommitSha,
        deploymentImageDigest: input.deploymentImageDigest,
      });
      return input.submitApproved(body, request);
    },
  });
}

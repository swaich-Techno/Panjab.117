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
  classification:
    | "response_accepted_and_stored"
    | "response_retained_for_duplicate_review"
    | "idempotent_replay"
    | "rate_limited_request"
    | "invalid_request"
    | "unauthorized_or_untrusted_request"
    | "service_failure"
    | "collection_disabled"
    | "preflight_allowed";
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
  onAuditFailure?: (event: SafeTransportAuditEvent) => void;
}) {
  assertExpectedOrigin(input.expectedOrigin);
  return async function handle(
    request: IntakeTransportRequest,
  ): Promise<IntakeTransportResponse> {
    let classification: SafeTransportAuditEvent["classification"] =
      "invalid_request";
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
          classification = "unauthorized_or_untrusted_request";
          return response(
            403,
            { error: "The request could not be accepted." },
            input.expectedOrigin,
            request.origin,
          );
        }
        classification = "preflight_allowed";
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
        classification = "invalid_request";
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
        classification = "unauthorized_or_untrusted_request";
        return response(
          400,
          { error: "The request could not be accepted." },
          input.expectedOrigin,
          request.origin,
        );
      }
      if (!receivedAtValid) {
        classification = "invalid_request";
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
        classification = "unauthorized_or_untrusted_request";
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
        classification = "invalid_request";
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
        classification = "invalid_request";
        return response(
          413,
          { error: "The request could not be accepted." },
          input.expectedOrigin,
          request.origin,
        );
      }
      const proof = csrfProof(request);
      if (!proof) {
        classification = "unauthorized_or_untrusted_request";
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
      classification =
        receipt.status === "accepted"
          ? "response_accepted_and_stored"
          : receipt.status === "duplicate"
            ? "response_retained_for_duplicate_review"
            : receipt.status === "replay"
              ? "idempotent_replay"
              : "rate_limited_request";
      const status =
        receipt.status === "accepted"
          ? 201
          : receipt.status === "duplicate"
            ? 202
            : receipt.status === "rate_limited"
              ? 429
              : receipt.receiptRecoveryVerified
                ? 200
                : 409;
      return response(status, receipt, input.expectedOrigin, request.origin);
    } catch (error) {
      const safe =
        error instanceof SafeIntakeError
          ? error
          : new SafeIntakeError("service_unavailable");
      classification =
        safe.code === "collection_disabled" ||
        safe.code === "age_policy_unapproved"
          ? "collection_disabled"
          : safe.code === "request_not_trusted"
            ? "unauthorized_or_untrusted_request"
            : safe.code === "invalid_request"
              ? "invalid_request"
              : "service_failure";
      return response(
        publicErrorStatus(safe.code),
        { error: safe.publicMessage },
        input.expectedOrigin,
        request.origin,
      );
    } finally {
      const event: SafeTransportAuditEvent = {
        event: "survey_intake_request",
        correlationId: safeCorrelationId,
        occurredAt: receivedAtValid
          ? request.receivedAt.toISOString()
          : "invalid-time",
        classification,
      };
      try {
        input.audit(event);
      } catch {
        try {
          input.onAuditFailure?.(event);
        } catch {
          // A best-effort edge-audit failure must never alter an HTTP result.
          // Accepted responses rely on the transactional database outbox.
        }
      }
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
  onAuditFailure?: (event: SafeTransportAuditEvent) => void;
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
    onAuditFailure: input.onAuditFailure,
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

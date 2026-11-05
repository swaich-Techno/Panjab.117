import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:https";
import { resolve } from "node:path";

const host = "127.0.0.1";
const port = Number.parseInt(process.env.STEP5E_STAGING_PORT ?? "4175", 10);
const keyFile = process.env.STEP5E_TLS_KEY_FILE;
const certificateFile = process.env.STEP5E_TLS_CERT_FILE;
const pfxFile = process.env.STEP5E_TLS_PFX_FILE;
const pfxPassword = process.env.STEP5E_TLS_PFX_PASSWORD;

if (!pfxFile && (!keyFile || !certificateFile)) {
  throw new Error(
    "A local PFX or PEM key/certificate pair is required; insecure HTTP fallback is disabled",
  );
}
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error("STEP5E_STAGING_PORT must be between 1024 and 65535");
}

const tls = {
  ...(pfxFile
    ? {
        pfx: readFileSync(resolve(pfxFile)),
        passphrase: pfxPassword,
      }
    : {
        key: readFileSync(resolve(keyFile)),
        cert: readFileSync(resolve(certificateFile)),
      }),
  minVersion: "TLSv1.3",
};
const template = readFileSync(resolve("staging/step5e/index.html"), "utf8");
const receipts = new Map();
const idempotency = new Map();
const expectedOrigin = `https://${host}:${port}`;

function digest(value) {
  return createHash("sha256").update(value, "utf8").digest();
}

function securityHeaders(nonce) {
  return {
    "cache-control": "no-store, max-age=0",
    "content-security-policy": [
      "default-src 'none'",
      `script-src 'nonce-${nonce}'`,
      `style-src 'nonce-${nonce}'`,
      "connect-src 'self'",
      "img-src 'self' data:",
      "font-src 'self'",
      "base-uri 'none'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
    "cross-origin-opener-policy": "same-origin",
    "cross-origin-resource-policy": "same-origin",
    "permissions-policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "referrer-policy": "no-referrer",
    "strict-transport-security": "max-age=31536000",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "x-robots-tag": "noindex, nofollow, noarchive",
  };
}

function sendJson(
  response,
  status,
  body,
  nonce = randomBytes(16).toString("base64url"),
) {
  response.writeHead(status, {
    ...securityHeaders(nonce),
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    let length = 0;
    request.on("data", (chunk) => {
      length += chunk.length;
      if (length > 32 * 1024) {
        reject(new Error("body too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () =>
      resolveBody(Buffer.concat(chunks).toString("utf8")),
    );
    request.on("error", reject);
  });
}

function cookieValue(request, name) {
  const cookies = String(request.headers.cookie ?? "").split(";");
  for (const cookie of cookies) {
    const [candidate, ...value] = cookie.trim().split("=");
    if (candidate === name) return value.join("=");
  }
  return null;
}

function trustedPost(request) {
  const cookieToken = cookieValue(request, "step5e_csrf");
  const headerToken = request.headers["x-step5e-csrf"];
  return (
    request.headers.origin === expectedOrigin &&
    ["same-origin", "same-site"].includes(
      String(request.headers["sec-fetch-site"] ?? ""),
    ) &&
    typeof headerToken === "string" &&
    typeof cookieToken === "string" &&
    cookieToken.length >= 32 &&
    headerToken.length === cookieToken.length &&
    timingSafeEqual(Buffer.from(headerToken), Buffer.from(cookieToken))
  );
}

function validSubmission(value) {
  return (
    value &&
    value.syntheticOnly === true &&
    ["en", "pa", "hi"].includes(value.locale) &&
    ["54", "55", "56", "57", "58", "59", "67", "69", "106"].includes(
      value.assemblySegment,
    ) &&
    value.ageConfirmed === true &&
    value.civicConsent === true &&
    typeof value.politicalConsent === "boolean" &&
    typeof value.idempotencyKey === "string" &&
    value.idempotencyKey.length >= 24 &&
    typeof value.withdrawalSecret === "string" &&
    /^[A-Za-z0-9_-]{43}$/u.test(value.withdrawalSecret)
  );
}

const server = createServer(tls, async (request, response) => {
  const nonce = randomBytes(16).toString("base64url");
  const url = new URL(request.url ?? "/", expectedOrigin);
  if (request.method === "GET" && url.pathname === "/") {
    const csrf = randomBytes(32).toString("base64url");
    const body = template
      .replaceAll("__STEP5E_NONCE__", nonce)
      .replaceAll("__STEP5E_CSRF__", csrf);
    response.writeHead(200, {
      ...securityHeaders(nonce),
      "content-type": "text/html; charset=utf-8",
      "set-cookie": `step5e_csrf=${csrf}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=1800`,
    });
    response.end(body);
    return;
  }
  if (request.method === "GET" && url.pathname === "/healthz") {
    sendJson(
      response,
      200,
      {
        status: "synthetic-local-only",
        productionCollectionEnabled: false,
        aiProviderEnabled: false,
      },
      nonce,
    );
    return;
  }
  if (request.method === "POST" && url.pathname === "/synthetic-intake") {
    if (!trustedPost(request)) {
      sendJson(
        response,
        403,
        { error: "The request could not be accepted." },
        nonce,
      );
      return;
    }
    try {
      const value = JSON.parse(await readBody(request));
      if (!validSubmission(value)) {
        sendJson(
          response,
          400,
          { error: "The request could not be accepted." },
          nonce,
        );
        return;
      }
      const existing = idempotency.get(value.idempotencyKey);
      if (existing) {
        const supplied = digest(value.withdrawalSecret);
        const verified = timingSafeEqual(existing.withdrawalDigest, supplied);
        sendJson(
          response,
          verified ? 200 : 409,
          verified
            ? {
                status: "replay",
                responseId: existing.responseId,
                withdrawalCode: value.withdrawalSecret,
              }
            : { error: "The request could not be accepted." },
          nonce,
        );
        return;
      }
      const responseId = randomUUID();
      const record = {
        responseId,
        withdrawalDigest: digest(value.withdrawalSecret),
        syntheticOnly: true,
      };
      receipts.set(responseId, record);
      idempotency.set(value.idempotencyKey, record);
      sendJson(
        response,
        201,
        {
          status: "accepted",
          responseId,
          withdrawalCode: value.withdrawalSecret,
          persistedToDisk: false,
        },
        nonce,
      );
    } catch {
      sendJson(
        response,
        400,
        { error: "The request could not be accepted." },
        nonce,
      );
    }
    return;
  }
  if (request.method === "POST" && url.pathname === "/withdraw") {
    if (!trustedPost(request)) {
      sendJson(
        response,
        403,
        { error: "The request could not be accepted." },
        nonce,
      );
      return;
    }
    try {
      const value = JSON.parse(await readBody(request));
      const record = receipts.get(value.responseId);
      const supplied = digest(String(value.withdrawalCode ?? ""));
      if (
        !record ||
        record.withdrawalDigest.length !== supplied.length ||
        !timingSafeEqual(record.withdrawalDigest, supplied)
      ) {
        sendJson(
          response,
          404,
          { error: "The request could not be accepted." },
          nonce,
        );
        return;
      }
      receipts.delete(value.responseId);
      for (const [key, candidate] of idempotency) {
        if (candidate.responseId === value.responseId) idempotency.delete(key);
      }
      sendJson(response, 200, { status: "synthetic_response_deleted" }, nonce);
    } catch {
      sendJson(
        response,
        400,
        { error: "The request could not be accepted." },
        nonce,
      );
    }
    return;
  }
  sendJson(response, 404, { error: "Not found" }, nonce);
});

server.listen(port, host, () => {
  process.stdout.write(`Step 5E synthetic HTTPS staging: ${expectedOrigin}\n`);
  process.stdout.write(
    "Synthetic memory only; production collection remains disabled.\n",
  );
});

function shutdown() {
  receipts.clear();
  idempotency.clear();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

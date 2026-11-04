import { describe, expect, it } from "vitest";

import { publicSecurityHeaders } from "./security/public-headers";
import {
  getPublicSiteOrigin,
  isPublicPreviewIndexingEnabled,
  publicPreviewRoutes,
} from "./public-site";

describe("public preview readiness", () => {
  it("enumerates every multilingual public route without an intake endpoint", () => {
    expect(publicPreviewRoutes).toHaveLength(21);
    expect(new Set(publicPreviewRoutes).size).toBe(21);
    expect(publicPreviewRoutes).toContain("/en/fatehgarh-sahib/survey");
    expect(publicPreviewRoutes.some((route) => route.includes("/api/"))).toBe(
      false,
    );
  });

  it("accepts HTTPS origins and localhost development only", () => {
    expect(getPublicSiteOrigin("https://example.org")).toBe(
      "https://example.org",
    );
    expect(getPublicSiteOrigin("http://localhost:3000")).toBe(
      "http://localhost:3000",
    );
    expect(getPublicSiteOrigin("http://example.org")).toBeNull();
    expect(getPublicSiteOrigin("https://user:pass@example.org")).toBeNull();
    expect(getPublicSiteOrigin("not a URL")).toBeNull();
  });

  it("keeps indexing disabled unless both approval and an origin exist", () => {
    const previousOrigin = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.org";
    try {
      expect(isPublicPreviewIndexingEnabled("false")).toBe(false);
      expect(isPublicPreviewIndexingEnabled("true")).toBe(true);
    } finally {
      if (previousOrigin === undefined) {
        delete process.env.NEXT_PUBLIC_SITE_URL;
      } else {
        process.env.NEXT_PUBLIC_SITE_URL = previousOrigin;
      }
    }
  });

  it("sets restrictive public security headers", () => {
    const headers = new Map(
      publicSecurityHeaders.map(({ key, value }) => [key, value]),
    );
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Content-Security-Policy")).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers.get("Content-Security-Policy")).toContain(
      "object-src 'none'",
    );
    expect(headers.get("Content-Security-Policy")).toContain(
      "connect-src 'self'",
    );
  });
});

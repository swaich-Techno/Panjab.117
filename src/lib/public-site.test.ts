import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { publicSecurityHeaders } from "./security/public-headers";
import {
  getPublicSiteOrigin,
  isPublicPreviewIndexingEnabled,
  publicPreviewRoutes,
} from "./public-site";

describe("public preview readiness", () => {
  it("enumerates every English-only public route without an intake endpoint", () => {
    expect(publicPreviewRoutes).toHaveLength(125);
    expect(new Set(publicPreviewRoutes).size).toBe(125);
    expect(publicPreviewRoutes).toContain("/en/fatehgarh-sahib/survey");
    expect(publicPreviewRoutes).toContain("/en/survey");
    expect(
      publicPreviewRoutes.filter((route) => route.includes("/constituencies/")),
    ).toHaveLength(117);
    expect(
      publicPreviewRoutes.some((route) => /\/(pa|hi)(\/|$)/u.test(route)),
    ).toBe(false);
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
    expect(headers.get("X-Robots-Tag")).toBe("noindex, nofollow, noarchive");
  });

  it("keeps Cloudflare Pages headers synchronized with the application policy", () => {
    const cloudflareHeaders = readFileSync(
      new URL("../../public/_headers", import.meta.url),
      "utf8",
    );

    for (const { key, value } of publicSecurityHeaders) {
      expect(cloudflareHeaders).toContain(`  ${key}: ${value}`);
    }

    expect(cloudflareHeaders).toContain(
      "Cache-Control: public, max-age=31536000, immutable",
    );
  });

  it("uses a temporary root redirect without adding a runtime", () => {
    const cloudflareRedirects = readFileSync(
      new URL("../../public/_redirects", import.meta.url),
      "utf8",
    );
    const staticPreviewServer = readFileSync(
      new URL("../../scripts/serve-static.mjs", import.meta.url),
      "utf8",
    );

    expect(cloudflareRedirects).toContain("/ /en/ 302");
    expect(cloudflareRedirects).toContain("/pa/* /en/:splat 301");
    expect(cloudflareRedirects).toContain("/hi/* /en/:splat 301");
    expect(cloudflareRedirects).not.toContain(" 200");
    expect(staticPreviewServer).toContain('Location: "/en/"');
    expect(staticPreviewServer).toContain("legacyEnglishRedirect");
  });

  it("allows long regional headings to wrap at narrow viewports", () => {
    const regionPage = readFileSync(
      new URL("../app/[locale]/regions/[region]/page.tsx", import.meta.url),
      "utf8",
    );

    expect(regionPage).toContain(
      'className="mt-4 break-words font-serif text-5xl',
    );
  });

  it("keeps small footer text above the normal-text contrast threshold", () => {
    const footer = readFileSync(
      new URL("../components/site-footer.tsx", import.meta.url),
      "utf8",
    );

    expect(footer).not.toContain("text-slate-500");
    expect(footer).toContain("text-slate-300");
  });
});

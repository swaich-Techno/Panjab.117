import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("Step 5E local browser-staging boundary", () => {
  const server = readFileSync(
    resolve("scripts/serve-step5e-staging.mjs"),
    "utf8",
  );
  const page = readFileSync(resolve("staging/step5e/index.html"), "utf8");

  it("binds only to loopback and refuses an insecure HTTP fallback", () => {
    expect(server).toContain('const host = "127.0.0.1"');
    expect(server).toContain('minVersion: "TLSv1.3"');
    expect(server).toContain("insecure HTTP fallback is disabled");
    expect(server).not.toMatch(/0\.0\.0\.0|from "node:http"/u);
  });

  it("does not use browser persistence, external calls or real-data language", () => {
    expect(page).not.toMatch(/localStorage|sessionStorage|indexedDB/u);
    expect(page).not.toMatch(/https?:\/\//u);
    expect(page).toContain("Local synthetic staging only");
    expect(page).toMatch(/No genuine participant\s+data/u);
  });

  it("is absent from the Next.js public route tree", () => {
    const publicSite = readFileSync(resolve("src/lib/public-site.ts"), "utf8");
    expect(publicSite).not.toContain("step5e");
    expect(publicSite).not.toContain("synthetic-intake");
  });
});

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve("out");
const locales = ["en", "pa", "hi"];
const regions = ["majha", "malwa", "doaba", "puadh"];
const routes = locales.flatMap((locale) => [
  `/${locale}`,
  ...regions.map((region) => `/${locale}/regions/${region}`),
  `/${locale}/fatehgarh-sahib`,
  `/${locale}/fatehgarh-sahib/survey`,
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function fileExists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

function routeFile(route) {
  return path.join(
    outputRoot,
    ...route.split("/").filter(Boolean),
    "index.html",
  );
}

function localTarget(value) {
  if (!value.startsWith("/")) return null;
  const url = new URL(value, "https://static.invalid");
  return decodeURIComponent(url.pathname);
}

async function targetExists(target) {
  if (target === "/") return true;
  if (target.startsWith("/_next/")) {
    return fileExists(
      path.join(outputRoot, ...target.split("/").filter(Boolean)),
    );
  }
  return fileExists(routeFile(target));
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(entryPath)));
    if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

assert(routes.length === 21, "Expected exactly 21 public preview routes");
assert(
  await fileExists(path.join(outputRoot, "404.html")),
  "Missing static 404 page",
);
assert(
  await fileExists(path.join(outputRoot, "_headers")),
  "Missing Cloudflare _headers",
);
assert(
  await fileExists(path.join(outputRoot, "_redirects")),
  "Missing Cloudflare _redirects",
);

let checkedLinks = 0;
for (const route of routes) {
  const filePath = routeFile(route);
  assert(await fileExists(filePath), `Missing route output: ${route}`);
  const html = await readFile(filePath, "utf8");
  const locale = route.split("/")[1];

  assert(
    html.includes(`<html lang="${locale}">`),
    `Incorrect html lang for ${route}`,
  );
  assert(/<title>[^<]+<\/title>/.test(html), `Missing title for ${route}`);
  assert(
    /<meta name="description" content="[^"]+"/.test(html),
    `Missing description for ${route}`,
  );
  assert(
    /<meta name="robots" content="noindex, nofollow"/.test(html),
    `Indexing is not disabled for ${route}`,
  );
  for (const alternateLocale of locales) {
    assert(
      new RegExp(`hreflang="${alternateLocale}"`, "i").test(html),
      `Missing ${alternateLocale} alternate for ${route}`,
    );
  }
  if (route.endsWith("/survey")) {
    assert(!/<form[\s>]/i.test(html), `Survey form found in ${route}`);
    assert(
      html.includes("fatehgarh-sahib-civic-2026-11-draft-1") &&
        html.includes("fatehgarh-sahib-consent-2026-11-draft-1"),
      `Missing versioned preview evidence in ${route}`,
    );
  }

  const references = html.matchAll(/(?:href|src)="([^"]+)"/g);
  for (const [, value] of references) {
    const target = localTarget(value);
    if (!target) continue;
    assert(
      await targetExists(target),
      `Broken local reference from ${route}: ${value}`,
    );
    checkedLinks += 1;
  }
}

const robots = await readFile(path.join(outputRoot, "robots.txt"), "utf8");
assert(/Disallow:\s*\//.test(robots), "robots.txt does not block indexing");

const sitemap = await readFile(path.join(outputRoot, "sitemap.xml"), "utf8");
assert(
  !sitemap.includes("<url>"),
  "Disabled sitemap unexpectedly contains URLs",
);

const redirects = await readFile(path.join(outputRoot, "_redirects"), "utf8");
assert(
  redirects.includes("/ /en/ 302"),
  "Root redirect is missing or not temporary",
);

const headers = await readFile(path.join(outputRoot, "_headers"), "utf8");
const headerRules = headers
  .split(/\r?\n/)
  .filter((line) => line.startsWith("/") && !line.startsWith("//"));
assert(headerRules.length <= 100, "Cloudflare header-rule limit exceeded");
for (const line of headers.split(/\r?\n/)) {
  assert(line.length <= 2_000, "Cloudflare header line limit exceeded");
}
for (const required of [
  "Content-Security-Policy",
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "X-Robots-Tag: noindex, nofollow, noarchive",
]) {
  assert(headers.includes(required), `Missing Cloudflare header: ${required}`);
}

const files = await walk(outputRoot);
assert(files.length <= 20_000, "Cloudflare Free file-count limit exceeded");
let largestFileBytes = 0;
for (const file of files) {
  const details = await stat(file);
  largestFileBytes = Math.max(largestFileBytes, details.size);
}
assert(
  largestFileBytes <= 25 * 1024 * 1024,
  "Cloudflare file-size limit exceeded",
);
assert(
  !files.some((file) => file.endsWith("_worker.js")),
  "Unexpected Worker runtime found",
);
assert(
  !files.some((file) => file.includes(`${path.sep}functions${path.sep}`)),
  "Unexpected Pages Function found",
);

console.log(
  JSON.stringify(
    {
      routes: routes.length,
      internalReferences: checkedLinks,
      outputFiles: files.length,
      largestFileBytes,
      headerRules: headerRules.length,
      indexingDisabled: true,
      runtimeFunctions: false,
    },
    null,
    2,
  ),
);

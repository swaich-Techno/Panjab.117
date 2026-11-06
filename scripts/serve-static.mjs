import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const outputRoot = path.resolve("out");
const port = Number.parseInt(process.env.PORT ?? "4173", 10);
const host = process.env.HOST ?? "127.0.0.1";

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".xml", "application/xml; charset=utf-8"],
]);

function parseHeaders(source) {
  const rules = [];
  let current = null;
  for (const rawLine of source.split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
    if (!rawLine.startsWith(" ") && !rawLine.startsWith("\t")) {
      current = { pattern: rawLine.trim(), headers: new Map() };
      rules.push(current);
      continue;
    }
    const separator = rawLine.indexOf(":");
    if (!current || separator < 0) continue;
    current.headers.set(
      rawLine.slice(0, separator).trim(),
      rawLine.slice(separator + 1).trim(),
    );
  }
  return rules;
}

function matches(pattern, pathname) {
  if (pattern === "/*") return true;
  if (pattern.endsWith("/*")) return pathname.startsWith(pattern.slice(0, -1));
  return pattern === pathname;
}

const headerRules = parseHeaders(
  await readFile(path.join(outputRoot, "_headers"), "utf8"),
);

function legacyEnglishRedirect(pathname) {
  for (const locale of ["pa", "hi"]) {
    if (pathname === `/${locale}` || pathname === `/${locale}/`) {
      return "/en/";
    }
    if (pathname.startsWith(`/${locale}/`)) {
      return `/en/${pathname.slice(locale.length + 2)}`;
    }
  }
  return null;
}

async function resolveFile(pathname) {
  if (pathname === "/_headers" || pathname === "/_redirects") return null;
  const decoded = decodeURIComponent(pathname);
  const relative = decoded.replace(/^\/+/, "");
  const candidate = path.resolve(outputRoot, relative);
  if (
    !candidate.startsWith(`${outputRoot}${path.sep}`) &&
    candidate !== outputRoot
  ) {
    return null;
  }

  const choices = [candidate];
  if (path.extname(candidate) === "")
    choices.push(path.join(candidate, "index.html"));
  for (const choice of choices) {
    try {
      if ((await stat(choice)).isFile()) return choice;
    } catch {
      // Try the next static-file candidate.
    }
  }
  return null;
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
    if (url.pathname === "/") {
      response.writeHead(302, { Location: "/en/" });
      response.end();
      return;
    }
    const legacyRedirect = legacyEnglishRedirect(url.pathname);
    if (legacyRedirect) {
      response.writeHead(301, { Location: `${legacyRedirect}${url.search}` });
      response.end();
      return;
    }

    const file = await resolveFile(url.pathname);
    const responseFile = file ?? path.join(outputRoot, "404.html");
    const statusCode = file ? 200 : 404;
    for (const rule of headerRules) {
      if (!matches(rule.pattern, url.pathname)) continue;
      for (const [name, value] of rule.headers) response.setHeader(name, value);
    }
    response.setHeader(
      "Content-Type",
      contentTypes.get(path.extname(responseFile)) ??
        "application/octet-stream",
    );
    response.writeHead(statusCode);
    if (request.method === "HEAD") response.end();
    else createReadStream(responseFile).pipe(response);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Static preview server error");
  }
});

server.listen(port, host, () => {
  console.log(`Static preview listening at http://${host}:${port}`);
});

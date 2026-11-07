import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  throw new Error(
    "Playwright is required for this optional browser check. Provide it through NODE_PATH or a local development install.",
  );
}

const host = "127.0.0.1";
const port = 4174;
const origin = `http://${host}:${port}`;
const screenshotDirectory = path.resolve(
  process.env.PANJAB_SCREENSHOT_DIR ?? ".browser-design-evidence",
);
const representativeRoutes = [
  "/en/",
  "/en/regions/malwa/",
  "/en/constituencies/55-fatehgarh-sahib/",
  "/en/fatehgarh-sahib/",
  "/en/fatehgarh-sahib/survey/",
  "/en/survey/",
];
const viewports = [320, 375, 390, 768, 1024, 1440];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function browserPath() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].filter(Boolean);
  const result = candidates.find((candidate) => existsSync(candidate));
  if (!result) throw new Error("Chrome or Edge was not found; set CHROME_PATH");
  return result;
}

async function waitFor(url) {
  const deadline = Date.now() + 20_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw lastError ?? new Error(`Timed out waiting for ${url}`);
}

async function stopProcess(child) {
  if (!child || child.exitCode !== null) return;
  child.kill();
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
}

async function expectFocusedHeading(page, label) {
  await page.locator("#preview-heading").waitFor();
  await page.waitForFunction(
    () => document.activeElement?.id === "preview-heading",
  );
  const heading = (
    await page.locator("#preview-heading").textContent()
  )?.trim();
  assert(heading, `${label} did not render a focused heading`);
  return heading;
}

await mkdir(screenshotDirectory, { recursive: true });
const server = spawn(process.execPath, ["scripts/serve-static.mjs"], {
  cwd: process.cwd(),
  env: { ...process.env, HOST: host, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true,
});
let browser;

try {
  await waitFor(`${origin}/en/`);
  browser = await chromium.launch({
    executablePath: browserPath(),
    headless: true,
  });
  const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 390, height: 900 },
  });
  const page = await context.newPage();
  const requests = [];
  const response404s = [];
  page.on("request", (request) =>
    requests.push({ method: request.method(), url: request.url() }),
  );
  page.on("response", (response) => {
    if (response.status() === 404) response404s.push(response.url());
  });

  const routeChecks = [];
  for (const route of representativeRoutes) {
    await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
    const result = await page.evaluate(() => ({
      h1: document.querySelector("h1")?.textContent?.trim() ?? null,
      lang: document.documentElement.lang,
      main: document.querySelectorAll("main").length,
      footer: document.querySelectorAll("footer").length,
      noindex: document
        .querySelector('meta[name="robots"]')
        ?.getAttribute("content")
        ?.includes("noindex"),
      skipLink: Boolean(document.querySelector('a[href="#main-content"]')),
      overflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    }));
    assert(result.lang === "en", `${route} does not render lang=en`);
    assert(result.h1, `${route} is missing its h1`);
    assert(result.main === 1, `${route} must contain one main landmark`);
    assert(result.footer === 1, `${route} must contain one footer landmark`);
    assert(result.noindex, `${route} is missing noindex`);
    assert(result.skipLink, `${route} is missing the skip link`);
    assert(!result.overflow, `${route} overflows at 390px`);
    routeChecks.push({ route, h1: result.h1 });
  }

  const reflowChecks = [];
  for (const width of viewports) {
    for (const route of ["/en/", "/en/fatehgarh-sahib/", "/en/survey/"]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      assert(!overflow, `${route} overflows at ${width}px`);
      reflowChecks.push({ route, width, overflow });
    }
  }

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(`${origin}/en/`, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  assert(
    (await page.evaluate(() =>
      document.activeElement?.getAttribute("href"),
    )) === "#main-content",
    "The skip link is not the first keyboard focus target",
  );
  await page.locator("summary").focus();
  await page.keyboard.press("Enter");
  assert(
    await page
      .getByLabel("Mobile navigation")
      .getByRole("link", { name: "Survey preview", exact: true })
      .isVisible(),
    "The mobile navigation did not open",
  );
  const directorySearch = page.getByRole("searchbox", {
    name: /Search this regional directory/i,
  });
  await directorySearch.fill("Fatehgarh Sahib");
  await page
    .getByRole("link", { name: /Fatehgarh Sahib/i })
    .last()
    .waitFor();
  assert(
    (await page.locator("#constituency-results > li").count()) === 1,
    "The constituency search did not narrow to one result",
  );
  await page.screenshot({
    fullPage: true,
    path: path.join(screenshotDirectory, "home-mobile.png"),
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/en/`, { waitUntil: "networkidle" });
  await page.screenshot({
    fullPage: true,
    path: path.join(screenshotDirectory, "home-desktop.png"),
  });

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${origin}/en/`, { waitUntil: "networkidle" });
  const zoom200Overflow = await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
    return (
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
    );
  });
  assert(!zoom200Overflow, "The homepage overflows at simulated 200% zoom");

  await page
    .getByRole("link", { name: /Fatehgarh Sahib/i })
    .first()
    .click();
  await page.waitForURL(/\/en\/fatehgarh-sahib\/?$/u);
  assert(
    (await page.locator('a[href^="/en/constituencies/"]').count()) === 9,
    "The Fatehgarh Sahib page does not expose exactly nine Assembly profiles",
  );
  await page.screenshot({
    fullPage: true,
    path: path.join(screenshotDirectory, "fatehgarh-desktop.png"),
  });

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(`${origin}/en/survey/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Continue/ }).click();
  assert(
    await page.locator('p[role="alert"]').isVisible(),
    "Empty eligibility did not expose an alert",
  );
  await page.getByRole("checkbox").nth(0).focus();
  await page.keyboard.press("Space");
  await page.getByRole("checkbox").nth(1).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: /Continue/ }).focus();
  await page.keyboard.press("Enter");
  const stageHeadings = [await expectFocusedHeading(page, "Consent")];

  await page.getByRole("button", { name: /Back/ }).click();
  stageHeadings.push(await expectFocusedHeading(page, "Backward navigation"));
  await page.getByRole("button", { name: /Continue/ }).click();
  await expectFocusedHeading(page, "Consent return");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Continue/ }).click();
  stageHeadings.push(await expectFocusedHeading(page, "Constituency"));
  await page.getByRole("searchbox").fill("Fatehgarh Sahib");
  await page.getByRole("radio", { name: /55.*Fatehgarh Sahib/i }).check();
  await page.getByRole("button", { name: /Continue/ }).click();
  stageHeadings.push(await expectFocusedHeading(page, "Civic priorities"));
  await page.getByRole("checkbox", { name: "Healthcare access" }).check();
  await page.getByRole("button", { name: /Continue/ }).click();
  stageHeadings.push(await expectFocusedHeading(page, "Political opinion"));
  await page
    .getByRole("radio", {
      name: "No, continue without political-opinion questions.",
    })
    .check();
  await page.getByRole("button", { name: /Continue/ }).click();
  stageHeadings.push(await expectFocusedHeading(page, "Review"));
  await page.getByRole("button", { name: /Show completion preview/ }).click();
  stageHeadings.push(await expectFocusedHeading(page, "Completion"));
  await page.getByRole("button", { name: /View future receipt flow/ }).click();
  stageHeadings.push(await expectFocusedHeading(page, "Receipt"));
  assert(
    await page.getByText("No receipt generated in preview").isVisible(),
    "The final non-receipt state is missing",
  );
  await page.screenshot({
    fullPage: true,
    path: path.join(screenshotDirectory, "survey-mobile-final.png"),
  });

  const reducedMotionDuration = await page
    .locator('[role="progressbar"] > *')
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  assert(
    reducedMotionDuration === "0s" ||
      Number.parseFloat(reducedMotionDuration) <= 0.001,
    `Reduced-motion transition remains ${reducedMotionDuration}`,
  );

  const root = await fetch(`${origin}/`, { redirect: "manual" });
  const pa = await fetch(`${origin}/pa/`, { redirect: "manual" });
  const hi = await fetch(`${origin}/hi/survey/`, { redirect: "manual" });
  assert(
    root.status === 302 && root.headers.get("location") === "/en/",
    "Root redirect failed",
  );
  assert(
    pa.status === 301 && pa.headers.get("location") === "/en/",
    "Punjabi redirect failed",
  );
  assert(
    hi.status === 301 && hi.headers.get("location") === "/en/survey/",
    "Hindi redirect failed",
  );

  const headers = await fetch(`${origin}/en/`, { method: "HEAD" });
  for (const name of [
    "content-security-policy",
    "permissions-policy",
    "referrer-policy",
    "x-content-type-options",
    "x-frame-options",
    "x-robots-tag",
  ]) {
    assert(headers.headers.has(name), `Missing security header: ${name}`);
  }
  assert(response404s.length === 0, `Observed 404 responses: ${response404s}`);
  assert(
    requests.every(({ url }) => url.startsWith(origin)),
    "The browser made an external request",
  );
  assert(
    requests.every(({ method }) => ["GET", "HEAD"].includes(method)),
    "The browser made a non-read-only request",
  );

  console.log(
    JSON.stringify(
      {
        browser: browserPath(),
        representativeRoutes: routeChecks,
        responsiveChecks: reflowChecks.length,
        viewportWidths: viewports,
        zoom200Overflow,
        keyboardControls: [
          "skip link",
          "mobile menu",
          "eligibility",
          "continue",
        ],
        questionnaireStages: stageHeadings,
        reducedMotionDuration,
        response404s,
        networkMethods: [...new Set(requests.map(({ method }) => method))],
        externalRequests: 0,
        screenshots: [
          "home-mobile.png",
          "home-desktop.png",
          "fatehgarh-desktop.png",
          "survey-mobile-final.png",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser?.close();
  await stopProcess(server);
}

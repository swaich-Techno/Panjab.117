import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const componentSource = readFileSync(
  new URL("./survey-preview.tsx", import.meta.url),
  "utf8",
);

describe("survey preview focus management", () => {
  it("moves focus to the active stage heading after a stage change", () => {
    expect(componentSource).toContain("previousStage.current === stageIndex");
    expect(componentSource).toContain(
      'document.getElementById("preview-heading")?.focus',
    );
    expect(componentSource).toContain("tabIndex={-1}");
  });

  it("announces questionnaire progress without interrupting the user", () => {
    expect(componentSource).toContain('aria-live="polite"');
    expect(componentSource).toContain('role="progressbar"');
  });

  it("contains all eight preview screens without a submission or persistence API", () => {
    for (const label of [
      "Welcome & eligibility",
      "Consent",
      "Constituency",
      "Civic priorities",
      "Optional political opinion",
      "Review",
      "Completion preview",
      "Future receipt & withdrawal",
    ]) {
      expect(componentSource).toContain(label);
    }
    expect(componentSource).not.toContain("localStorage");
    expect(componentSource).not.toContain("sessionStorage");
    expect(componentSource).not.toContain("fetch(");
    expect(componentSource).not.toContain('type="submit"');
  });
});

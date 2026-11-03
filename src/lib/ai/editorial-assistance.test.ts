import { describe, expect, it, vi } from "vitest";

import {
  aiAssistanceConfiguration,
  createEditorialDraft,
  type DraftVersionRepository,
  type EditorialDraftProvider,
} from "./editorial-assistance";

const request = {
  purpose: "neutral_survey_description",
  locale: "en",
  sourceText: "Synthetic public description only",
  sourceVersion: "synthetic-v1",
  dataClassification: "public_editorial_source",
} as const;

describe("provider-neutral editorial assistance", () => {
  it("is disabled by default before a provider can be called", async () => {
    const provider: EditorialDraftProvider = { createDraft: vi.fn() };
    const repository: DraftVersionRepository = { save: vi.fn() };
    await expect(
      createEditorialDraft(request, {
        enabled: aiAssistanceConfiguration.enabled,
        provider,
        repository,
      }),
    ).rejects.toThrow("AI editorial assistance is disabled");
    expect(provider.createDraft).not.toHaveBeenCalled();
  });

  it("creates an immutable review version when explicitly enabled", async () => {
    const saved: unknown[] = [];
    const version = await createEditorialDraft(request, {
      enabled: true,
      provider: {
        async createDraft() {
          return {
            text: "Neutral synthetic draft",
            provider: "fake",
            model: "fake",
          };
        },
      },
      repository: {
        async save(value) {
          saved.push(value);
        },
      },
      now: () => new Date("2026-11-03T12:00:00.000Z"),
      createId: () => "synthetic-draft-id",
    });
    expect(version.status).toBe("awaiting_editorial_review");
    expect(version.request.sourceVersion).toBe("synthetic-v1");
    expect(saved).toEqual([version]);
  });
});

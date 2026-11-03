import { randomUUID } from "node:crypto";

import type { Locale } from "../i18n";

export type EditorialDraftRequest = {
  purpose: "neutral_survey_description" | "explanatory_copy";
  locale: Locale;
  sourceText: string;
  sourceVersion: string;
  dataClassification: "public_editorial_source";
};

export type EditorialDraft = {
  text: string;
  provider: string;
  model: string;
};

export interface EditorialDraftProvider {
  createDraft(request: EditorialDraftRequest): Promise<EditorialDraft>;
}

export type DraftVersion = EditorialDraft & {
  id: string;
  createdAt: string;
  request: EditorialDraftRequest;
  status: "awaiting_editorial_review" | "approved" | "rejected";
};

export interface DraftVersionRepository {
  save(version: DraftVersion): Promise<void>;
}

export class AiAssistanceDisabledError extends Error {
  constructor() {
    super("AI editorial assistance is disabled");
    this.name = "AiAssistanceDisabledError";
  }
}

export async function createEditorialDraft(
  request: EditorialDraftRequest,
  options: {
    enabled: boolean;
    provider: EditorialDraftProvider;
    repository: DraftVersionRepository;
    now?: () => Date;
    createId?: () => string;
  },
): Promise<DraftVersion> {
  if (!options.enabled) {
    throw new AiAssistanceDisabledError();
  }

  const draft = await options.provider.createDraft(request);
  const version: DraftVersion = {
    ...draft,
    id: options.createId?.() ?? randomUUID(),
    createdAt: (options.now?.() ?? new Date()).toISOString(),
    request,
    status: "awaiting_editorial_review",
  };
  await options.repository.save(version);
  return version;
}

export const aiAssistanceConfiguration = {
  enabled: false,
  permitsConfidentialResponseData: false,
  requiresEditorialApproval: true,
} as const;

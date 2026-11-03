"use client";

import { useMemo, useState } from "react";

import type { SurveyPreviewCopy } from "@/lib/survey/preview-translations";

export type LocalizedPreviewQuestion = {
  id: string;
  prompt: string;
  helpText?: string;
  responseType: "single_choice" | "multiple_choice";
  required: boolean;
  politicalOpinion: boolean;
  options: readonly { id: string; label: string }[];
};

export type LocalizedConsentPreview = {
  title: string;
  voluntary: string;
  purpose: string;
  dataCollected: string;
  dataNotCollectedInPreview: string;
  anonymousExplanation: string;
  identifiableExplanation: string;
  retention: string;
  withdrawal: string;
  privacyContact: string;
  coreConsentLabel: string;
  politicalTitle: string;
  politicalExplanation: string;
  politicalConsentLabel: string;
  politicalDeclineLabel: string;
  nonRepresentativeNotice: string;
  reviewRequired: string;
};

type PreviewStage =
  | { kind: "consent"; id: "consent" }
  | { kind: "question"; id: string; question: LocalizedPreviewQuestion }
  | { kind: "political-consent"; id: "political-consent" }
  | { kind: "review"; id: "review" };

type SurveyPreviewProps = {
  consent: LocalizedConsentPreview;
  copy: SurveyPreviewCopy;
  questions: readonly LocalizedPreviewQuestion[];
  questionnaireVersion: string;
  consentVersion: string;
};

export function SurveyPreview({
  consent,
  copy,
  questions,
  questionnaireVersion,
  consentVersion,
}: SurveyPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [civicConsent, setCivicConsent] = useState(false);
  const [politicalConsent, setPoliticalConsent] = useState<boolean | null>(
    null,
  );
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [error, setError] = useState("");

  const stages = useMemo<readonly PreviewStage[]>(() => {
    const civicQuestions = questions.filter(
      ({ politicalOpinion }) => !politicalOpinion,
    );
    const politicalQuestions = questions.filter(
      ({ politicalOpinion }) => politicalOpinion,
    );
    return [
      { kind: "consent", id: "consent" },
      ...civicQuestions.map((question) => ({
        kind: "question" as const,
        id: question.id,
        question,
      })),
      { kind: "political-consent", id: "political-consent" },
      ...(politicalConsent === true
        ? politicalQuestions.map((question) => ({
            kind: "question" as const,
            id: question.id,
            question,
          }))
        : []),
      { kind: "review", id: "review" },
    ];
  }, [politicalConsent, questions]);

  const stage = stages[Math.min(currentIndex, stages.length - 1)]!;
  const progress = Math.round(((currentIndex + 1) / stages.length) * 100);

  function goBack() {
    setError("");
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function validateAndContinue() {
    if (stage.kind === "consent" && !civicConsent) {
      setError(copy.consentError);
      return;
    }
    if (
      stage.kind === "question" &&
      stage.question.required &&
      !answers[stage.question.id]
    ) {
      setError(copy.segmentError);
      return;
    }
    if (stage.kind === "political-consent" && politicalConsent === null) {
      setError(copy.politicalChoiceError);
      return;
    }
    setError("");
    setCurrentIndex((index) => Math.min(stages.length - 1, index + 1));
  }

  function answerSingle(questionId: string, optionId: string) {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    setError("");
  }

  function toggleMultiple(questionId: string, optionId: string) {
    const existing = Array.isArray(answers[questionId])
      ? (answers[questionId] as string[])
      : [];
    if (!existing.includes(optionId) && existing.length >= 3) {
      setError(copy.selectionLimit);
      return;
    }
    const next = existing.includes(optionId)
      ? existing.filter((value) => value !== optionId)
      : [...existing, optionId];
    setAnswers((current) => ({ ...current, [questionId]: next }));
    setError("");
  }

  function choosePoliticalConsent(value: boolean) {
    setPoliticalConsent(value);
    if (!value) {
      const politicalQuestionIds = new Set(
        questions
          .filter(({ politicalOpinion }) => politicalOpinion)
          .map(({ id }) => id),
      );
      setAnswers((current) =>
        Object.fromEntries(
          Object.entries(current).filter(
            ([questionId]) => !politicalQuestionIds.has(questionId),
          ),
        ),
      );
    }
    setError("");
  }

  function skipQuestion() {
    if (stage.kind !== "question" || stage.question.required) return;
    setAnswers((current) => {
      const next = { ...current };
      delete next[stage.question.id];
      return next;
    });
    setError("");
    setCurrentIndex((index) => Math.min(stages.length - 1, index + 1));
  }

  function restart() {
    setCurrentIndex(0);
    setCivicConsent(false);
    setPoliticalConsent(null);
    setAnswers({});
    setError("");
  }

  return (
    <section
      aria-labelledby="preview-heading"
      className="mt-12 overflow-hidden rounded-3xl border border-[#d8c9a5] bg-white shadow-[0_24px_70px_rgba(13,33,55,0.1)]"
    >
      <div className="border-b border-[#d8c9a5] bg-[#fffaf0] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold tracking-[0.14em] text-[#755a25] uppercase">
            {copy.previewLabel}
          </p>
          <p className="text-xs text-slate-600">
            {copy.step} {currentIndex + 1} {copy.of} {stages.length}
          </p>
        </div>
        <div
          aria-label={copy.progress}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          className="mt-4 h-2 overflow-hidden rounded-full bg-[#e6dcc3]"
          role="progressbar"
        >
          <div
            className="h-full rounded-full bg-[#173a5e] transition-[width] motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-5 sm:p-8">
        {stage.kind === "consent" ? (
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-[#8b6c2f] uppercase">
              {consent.reviewRequired}
            </p>
            <h2
              className="mt-4 font-serif text-3xl font-bold text-[#0d2137]"
              id="preview-heading"
            >
              {consent.title}
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
              <p>{consent.voluntary}</p>
              <p>{consent.purpose}</p>
              <p>{consent.dataCollected}</p>
              <p className="rounded-2xl border border-[#d8c9a5] bg-[#fffdf7] p-4 font-semibold text-[#0d2137]">
                {consent.dataNotCollectedInPreview}
              </p>
              <details className="rounded-2xl border border-slate-300 p-4">
                <summary className="cursor-pointer font-bold text-[#0d2137]">
                  {copy.anonymousDetails}
                </summary>
                <div className="mt-3 space-y-3">
                  <p>{consent.anonymousExplanation}</p>
                  <p>{consent.identifiableExplanation}</p>
                </div>
              </details>
              <details className="rounded-2xl border border-slate-300 p-4">
                <summary className="cursor-pointer font-bold text-[#0d2137]">
                  {copy.retentionDetails}
                </summary>
                <div className="mt-3 space-y-3">
                  <p>{consent.retention}</p>
                  <p>{consent.withdrawal}</p>
                  <p>{consent.privacyContact}</p>
                </div>
              </details>
              <p>{consent.nonRepresentativeNotice}</p>
            </div>
            <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-[#b08d46] bg-[#fffaf0] p-4 font-semibold text-[#0d2137]">
              <input
                checked={civicConsent}
                className="mt-1 size-5 shrink-0 accent-[#173a5e]"
                onChange={(event) => {
                  setCivicConsent(event.target.checked);
                  setError("");
                }}
                type="checkbox"
              />
              <span>{consent.coreConsentLabel}</span>
            </label>
          </div>
        ) : null}

        {stage.kind === "question" ? (
          <fieldset>
            <legend
              className="font-serif text-3xl font-bold leading-tight text-[#0d2137]"
              id="preview-heading"
            >
              {stage.question.prompt}
            </legend>
            <p className="mt-3 text-sm font-semibold text-[#755a25]">
              {stage.question.required ? copy.required : copy.optional} ·{" "}
              {stage.question.responseType === "multiple_choice"
                ? copy.chooseUpToThree
                : copy.chooseOne}
            </p>
            {stage.question.helpText ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {stage.question.helpText}
              </p>
            ) : null}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {stage.question.options.map((option) => {
                const multiple =
                  stage.question.responseType === "multiple_choice";
                const selected = multiple
                  ? Array.isArray(answers[stage.question.id]) &&
                    (answers[stage.question.id] as string[]).includes(option.id)
                  : answers[stage.question.id] === option.id;
                return (
                  <label
                    className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 font-semibold transition-colors motion-reduce:transition-none ${selected ? "border-[#173a5e] bg-[#eaf1f7] text-[#0d2137]" : "border-slate-300 bg-white text-slate-700 hover:border-[#8b6c2f]"}`}
                    key={option.id}
                  >
                    <input
                      checked={selected}
                      className="size-5 shrink-0 accent-[#173a5e]"
                      name={stage.question.id}
                      onChange={() =>
                        multiple
                          ? toggleMultiple(stage.question.id, option.id)
                          : answerSingle(stage.question.id, option.id)
                      }
                      type={multiple ? "checkbox" : "radio"}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {stage.kind === "political-consent" ? (
          <fieldset>
            <legend
              className="font-serif text-3xl font-bold leading-tight text-[#0d2137]"
              id="preview-heading"
            >
              {consent.politicalTitle}
            </legend>
            <p className="mt-4 leading-7 text-slate-700">
              {consent.politicalExplanation}
            </p>
            <p className="mt-5 font-semibold text-[#0d2137]">
              {copy.politicalChoiceTitle}
            </p>
            <div className="mt-4 grid gap-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-300 p-4 font-semibold text-[#0d2137]">
                <input
                  checked={politicalConsent === true}
                  className="mt-1 size-5 accent-[#173a5e]"
                  name="political-consent"
                  onChange={() => {
                    choosePoliticalConsent(true);
                  }}
                  type="radio"
                />
                <span>
                  {copy.politicalYes}
                  <span className="mt-2 block text-sm font-normal text-slate-600">
                    {consent.politicalConsentLabel}
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-300 p-4 font-semibold text-[#0d2137]">
                <input
                  checked={politicalConsent === false}
                  className="mt-1 size-5 accent-[#173a5e]"
                  name="political-consent"
                  onChange={() => {
                    choosePoliticalConsent(false);
                  }}
                  type="radio"
                />
                <span>
                  {copy.politicalNo}
                  <span className="mt-2 block text-sm font-normal text-slate-600">
                    {consent.politicalDeclineLabel}
                  </span>
                </span>
              </label>
            </div>
          </fieldset>
        ) : null}

        {stage.kind === "review" ? (
          <div aria-live="polite">
            <h2
              className="font-serif text-3xl font-bold text-[#0d2137]"
              id="preview-heading"
            >
              {copy.reviewTitle}
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-700">
              {copy.reviewBody}
            </p>
            <p className="mt-5 rounded-2xl border border-[#d8c9a5] bg-[#fffaf0] p-4 font-bold text-[#0d2137]">
              {copy.answeredCount}:{" "}
              {
                Object.values(answers).filter((value) =>
                  Array.isArray(value) ? value.length > 0 : Boolean(value),
                ).length
              }
            </p>
            <p className="mt-4 text-sm font-bold text-[#9c2f1b]">
              {copy.noSubmission}
            </p>
            <button
              className="button-secondary mt-7"
              onClick={restart}
              type="button"
            >
              {copy.restart}
            </button>
          </div>
        ) : null}

        {error ? (
          <p
            aria-live="assertive"
            className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 font-semibold text-red-900"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {stage.kind !== "review" ? (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
            <button
              className="button-secondary disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentIndex === 0}
              onClick={goBack}
              type="button"
            >
              ← {copy.back}
            </button>
            <div className="flex flex-wrap gap-3">
              {stage.kind === "question" && !stage.question.required ? (
                <button
                  className="min-h-12 px-4 font-bold text-slate-700 underline decoration-[#b08d46] decoration-2 underline-offset-4"
                  onClick={skipQuestion}
                  type="button"
                >
                  {copy.skip}
                </button>
              ) : null}
              <button
                className="button-primary"
                onClick={validateAndContinue}
                type="button"
              >
                {copy.next} →
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-[#d8c9a5] bg-[#f6f1e5] px-5 py-3 text-xs text-slate-600 sm:px-8">
        {copy.questionnaireVersion} {questionnaireVersion} ·{" "}
        {copy.consentVersion} {consentVersion}
      </div>
    </section>
  );
}

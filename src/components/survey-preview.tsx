"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { constituencies } from "@/data/constituencies";
import { fatehgarhSahibSegments } from "@/data/fatehgarh-sahib";

type SurveyPreviewProps = { scope: "fatehgarh" | "statewide" };

const stages = [
  "Welcome & eligibility",
  "Consent",
  "Constituency",
  "Civic priorities",
  "Optional political opinion",
  "Review",
  "Completion preview",
  "Future receipt & withdrawal",
] as const;

const civicPriorities = [
  "Road infrastructure and public transport",
  "Healthcare access",
  "Education and skills",
  "Employment opportunities",
  "Agriculture and livelihoods",
  "Water and sanitation",
  "Everyday public services",
  "Another local priority",
] as const;

export function SurveyPreview({ scope }: SurveyPreviewProps) {
  const searchId = useId();
  const [stageIndex, setStageIndex] = useState(0);
  const [adult, setAdult] = useState(false);
  const [resident, setResident] = useState(false);
  const [coreConsent, setCoreConsent] = useState(false);
  const [selectedConstituency, setSelectedConstituency] = useState<
    number | null
  >(null);
  const [query, setQuery] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);
  const [serviceRating, setServiceRating] = useState("");
  const [politicalChoice, setPoliticalChoice] = useState<"yes" | "no" | null>(
    null,
  );
  const [politicalFactor, setPoliticalFactor] = useState("");
  const [error, setError] = useState("");
  const previousStage = useRef(stageIndex);
  const availableConstituencies =
    scope === "fatehgarh" ? fatehgarhSahibSegments : constituencies;
  const filteredConstituencies = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("en");
    if (!normalized) return availableConstituencies;
    return availableConstituencies.filter(
      ({ name, number }) =>
        name.toLocaleLowerCase("en").includes(normalized) ||
        String(number).includes(normalized),
    );
  }, [availableConstituencies, query]);
  const selectedRecord = constituencies.find(
    ({ number }) => number === selectedConstituency,
  );
  const progress = Math.round(((stageIndex + 1) / stages.length) * 100);

  useEffect(() => {
    if (previousStage.current === stageIndex) return;
    previousStage.current = stageIndex;
    const frame = requestAnimationFrame(() => {
      document.getElementById("preview-heading")?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [stageIndex]);

  function validateCurrentStage(): string | null {
    if (stageIndex === 0 && (!adult || !resident))
      return "Confirm both eligibility statements to continue.";
    if (stageIndex === 1 && !coreConsent)
      return "Confirm the civic-research preview consent to continue.";
    if (stageIndex === 2 && selectedConstituency === null)
      return "Choose your current Assembly constituency to continue.";
    if (stageIndex === 3 && priorities.length === 0)
      return "Choose at least one local civic priority to continue.";
    if (stageIndex === 4 && politicalChoice === null)
      return "Choose whether to include the optional political-opinion preview.";
    return null;
  }

  function continuePreview() {
    const validationError = validateCurrentStage();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStageIndex((current) => Math.min(stages.length - 1, current + 1));
  }

  function togglePriority(priority: string) {
    setPriorities((current) => {
      if (current.includes(priority))
        return current.filter((item) => item !== priority);
      if (current.length >= 3) {
        setError("Choose no more than three civic priorities.");
        return current;
      }
      setError("");
      return [...current, priority];
    });
  }

  function restart() {
    setStageIndex(0);
    setAdult(false);
    setResident(false);
    setCoreConsent(false);
    setSelectedConstituency(null);
    setQuery("");
    setPriorities([]);
    setServiceRating("");
    setPoliticalChoice(null);
    setPoliticalFactor("");
    setError("");
  }

  return (
    <section
      aria-labelledby="preview-heading"
      className="overflow-hidden rounded-[2rem] border border-[#d8c9a5] bg-white shadow-[0_28px_80px_rgba(13,33,55,0.12)]"
    >
      <div className="border-b border-[#d8c9a5] bg-[#fffaf0] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[#755a25] uppercase">
              Interactive design preview
            </p>
            <p className="mt-2 text-sm font-semibold text-[#0d2137]">
              {scope === "fatehgarh"
                ? "Phase 1 · nine Assembly segments"
                : "Phase 2 · all 117 Assembly constituencies"}
            </p>
          </div>
          <p
            aria-atomic="true"
            aria-live="polite"
            className="rounded-full bg-[#0d2137] px-4 py-2 text-xs font-bold text-white"
          >
            Step {stageIndex + 1} of {stages.length}
          </p>
        </div>
        <div
          aria-label="Questionnaire preview progress"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          className="mt-5 h-2 overflow-hidden rounded-full bg-[#e6dcc3]"
          role="progressbar"
        >
          <div
            className="h-full rounded-full bg-[#173a5e] transition-[width] motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-5 sm:p-8 lg:p-10">
        <p className="mb-6 w-fit rounded-full border border-[#d8c9a5] bg-[#f8f4e9] px-4 py-2 text-xs font-bold text-[#7d2d1f]">
          No response leaves this browser tab
        </p>

        {stageIndex === 0 ? (
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-[#755a25] uppercase">
              Welcome & eligibility
            </p>
            <h2
              className="mt-4 scroll-mt-6 font-serif text-3xl font-bold text-[#0d2137] outline-none sm:text-4xl"
              id="preview-heading"
              tabIndex={-1}
            >
              A voluntary civic-research preview
            </h2>
            <p className="mt-5 max-w-3xl leading-8 text-slate-700">
              The proposed survey would ask adult residents about local services
              and priorities. Participation would be voluntary. This preview
              stores choices only in temporary component memory and cannot
              submit them.
            </p>
            <div className="mt-7 grid gap-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-300 p-4 font-semibold text-[#0d2137]">
                <input
                  checked={adult}
                  className="mt-1 size-5 accent-[#173a5e]"
                  onChange={(event) => {
                    setAdult(event.target.checked);
                    setError("");
                  }}
                  type="checkbox"
                />
                <span>I confirm that I am at least 18 years old.</span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-300 p-4 font-semibold text-[#0d2137]">
                <input
                  checked={resident}
                  className="mt-1 size-5 accent-[#173a5e]"
                  onChange={(event) => {
                    setResident(event.target.checked);
                    setError("");
                  }}
                  type="checkbox"
                />
                <span>
                  I currently live in{" "}
                  {scope === "fatehgarh"
                    ? "one of the nine listed Fatehgarh Sahib parliamentary segments"
                    : "a Punjab Assembly constituency"}
                  .
                </span>
              </label>
            </div>
          </div>
        ) : null}

        {stageIndex === 1 ? (
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-[#755a25] uppercase">
              Participant information & consent
            </p>
            <h2
              className="mt-4 scroll-mt-6 font-serif text-3xl font-bold text-[#0d2137] outline-none sm:text-4xl"
              id="preview-heading"
              tabIndex={-1}
            >
              Understand the proposed use before choosing
            </h2>
            <div className="mt-6 grid gap-4 text-sm leading-7 text-slate-700 md:grid-cols-2">
              <div className="rounded-2xl border border-[#d8c9a5] bg-[#fffdf7] p-5">
                <h3 className="font-bold text-[#0d2137]">
                  Proposed collection
                </h3>
                <p className="mt-2">
                  Eligibility confirmation, Assembly constituency and
                  civic-priority responses. Political opinion would require a
                  separate optional choice.
                </p>
              </div>
              <div className="rounded-2xl border border-[#d8c9a5] bg-[#fffdf7] p-5">
                <h3 className="font-bold text-[#0d2137]">Research limits</h3>
                <p className="mt-2">
                  Voluntary recruitment would not create a representative poll,
                  electoral forecast or statistical guarantee.
                </p>
              </div>
              <div className="rounded-2xl border border-[#d8c9a5] bg-[#fffdf7] p-5">
                <h3 className="font-bold text-[#0d2137]">Privacy gate</h3>
                <p className="mt-2">
                  Real intake requires approved retention, withdrawal,
                  encryption, access, backup, incident-response and
                  privacy-contact arrangements.
                </p>
              </div>
              <div className="rounded-2xl border border-[#d8c9a5] bg-[#fffdf7] p-5">
                <h3 className="font-bold text-[#0d2137]">Preview boundary</h3>
                <p className="mt-2">
                  No endpoint, database, browser storage, analytics tracker or
                  external AI receives these preview choices.
                </p>
              </div>
            </div>
            <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-[#b08d46] bg-[#fffaf0] p-5 font-semibold text-[#0d2137]">
              <input
                checked={coreConsent}
                className="mt-1 size-5 accent-[#173a5e]"
                onChange={(event) => {
                  setCoreConsent(event.target.checked);
                  setError("");
                }}
                type="checkbox"
              />
              <span>
                I have read this preview notice and choose to continue through
                the civic questionnaire design.
              </span>
            </label>
          </div>
        ) : null}

        {stageIndex === 2 ? (
          <fieldset>
            <legend
              className="scroll-mt-6 font-serif text-3xl font-bold text-[#0d2137] outline-none sm:text-4xl"
              id="preview-heading"
              tabIndex={-1}
            >
              Which Assembly constituency do you currently live in?
            </legend>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
              Choose exactly one. The list uses official numbers and English
              names.{" "}
              {scope === "fatehgarh"
                ? "Only the nine Phase 1 segments are shown."
                : "All 117 Punjab Assembly constituencies are shown."}
            </p>
            <label
              className="mt-6 block text-sm font-bold text-[#0d2137]"
              htmlFor={searchId}
            >
              Search constituency name or number
            </label>
            <input
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-400 px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-[#b08d46]/50"
              id={searchId}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="For example: Fatehgarh Sahib or 55"
              type="search"
              value={query}
            />
            <div
              className="mt-4 max-h-80 overflow-y-auto rounded-2xl border border-slate-300 p-2"
              role="radiogroup"
              aria-label="Assembly constituency options"
            >
              {filteredConstituencies.length ? (
                filteredConstituencies.map((entry) => (
                  <label
                    className="flex cursor-pointer items-center gap-3 rounded-xl p-3 hover:bg-[#f8f4e9]"
                    key={entry.number}
                  >
                    <input
                      checked={selectedConstituency === entry.number}
                      className="size-5 accent-[#173a5e]"
                      name="constituency"
                      onChange={() => {
                        setSelectedConstituency(entry.number);
                        setError("");
                      }}
                      type="radio"
                    />
                    <span className="font-semibold text-[#0d2137]">
                      {entry.number} — {entry.name}
                      {entry.reservedForScheduledCastes ? " (SC)" : ""}
                    </span>
                  </label>
                ))
              ) : (
                <p className="p-4 text-sm text-slate-700">
                  No constituency matches that search.
                </p>
              )}
            </div>
          </fieldset>
        ) : null}

        {stageIndex === 3 ? (
          <div>
            <h2
              className="scroll-mt-6 font-serif text-3xl font-bold text-[#0d2137] outline-none sm:text-4xl"
              id="preview-heading"
              tabIndex={-1}
            >
              Local civic priorities
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              Choose up to three areas that should receive attention. This
              preview does not treat selections as findings.
            </p>
            <fieldset className="mt-6">
              <legend className="font-bold text-[#0d2137]">
                Priority areas
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {civicPriorities.map((priority) => (
                  <label
                    className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-slate-300 p-4 font-semibold text-slate-800"
                    key={priority}
                  >
                    <input
                      checked={priorities.includes(priority)}
                      className="size-5 accent-[#173a5e]"
                      onChange={() => togglePriority(priority)}
                      type="checkbox"
                    />
                    <span>{priority}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="mt-8">
              <legend className="font-bold text-[#0d2137]">
                Overall access to local public services{" "}
                <span className="font-normal text-slate-600">(optional)</span>
              </legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {[
                  "Very good",
                  "Good",
                  "Fair",
                  "Poor",
                  "Very poor",
                  "Prefer not to answer",
                ].map((rating) => (
                  <label
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold"
                    key={rating}
                  >
                    <input
                      checked={serviceRating === rating}
                      className="accent-[#173a5e]"
                      name="rating"
                      onChange={() => setServiceRating(rating)}
                      type="radio"
                    />
                    {rating}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}

        {stageIndex === 4 ? (
          <fieldset>
            <legend
              className="scroll-mt-6 font-serif text-3xl font-bold text-[#0d2137] outline-none sm:text-4xl"
              id="preview-heading"
              tabIndex={-1}
            >
              Optional political-opinion section
            </legend>
            <p className="mt-4 max-w-3xl leading-8 text-slate-700">
              Political opinion is separate from the civic questions and never
              mandatory. No party or candidate directory is presented because
              candidate status is not being verified for this preview.
            </p>
            <div className="mt-6 grid gap-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-300 p-5 font-semibold text-[#0d2137]">
                <input
                  checked={politicalChoice === "yes"}
                  className="mt-1 size-5 accent-[#173a5e]"
                  name="political-choice"
                  onChange={() => {
                    setPoliticalChoice("yes");
                    setError("");
                  }}
                  type="radio"
                />
                <span>
                  Yes, include one neutral political-opinion preview question.
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-300 p-5 font-semibold text-[#0d2137]">
                <input
                  checked={politicalChoice === "no"}
                  className="mt-1 size-5 accent-[#173a5e]"
                  name="political-choice"
                  onChange={() => {
                    setPoliticalChoice("no");
                    setPoliticalFactor("");
                    setError("");
                  }}
                  type="radio"
                />
                <span>No, continue without political-opinion questions.</span>
              </label>
            </div>
            {politicalChoice === "yes" ? (
              <div className="mt-7 rounded-2xl border border-[#d8c9a5] bg-[#fffdf7] p-5">
                <label
                  className="block font-bold text-[#0d2137]"
                  htmlFor="political-factor"
                >
                  Which factor matters most when assessing public
                  representatives?{" "}
                  <span className="font-normal text-slate-600">(optional)</span>
                </label>
                <select
                  className="mt-3 min-h-12 w-full rounded-xl border border-slate-400 bg-white px-4"
                  id="political-factor"
                  onChange={(event) => setPoliticalFactor(event.target.value)}
                  value={politicalFactor}
                >
                  <option value="">Choose an option</option>
                  <option>Local performance and responsiveness</option>
                  <option>Policy programme</option>
                  <option>Candidate experience and conduct</option>
                  <option>Party record</option>
                  <option>Undecided</option>
                  <option>Prefer not to answer</option>
                </select>
              </div>
            ) : null}
          </fieldset>
        ) : null}

        {stageIndex === 5 ? (
          <div>
            <h2
              className="scroll-mt-6 font-serif text-3xl font-bold text-[#0d2137] outline-none sm:text-4xl"
              id="preview-heading"
              tabIndex={-1}
            >
              Review your preview choices
            </h2>
            <p className="mt-4 max-w-3xl leading-8 text-slate-700">
              Nothing has been submitted. Use the edit buttons to return to an
              earlier screen.
            </p>
            <dl className="mt-7 divide-y divide-slate-200 rounded-2xl border border-[#d8c9a5] bg-[#fffdf7]">
              {[
                [
                  "Eligibility",
                  adult && resident
                    ? "Adult resident confirmations selected"
                    : "Incomplete",
                  0,
                ],
                [
                  "Consent",
                  coreConsent ? "Preview consent selected" : "Incomplete",
                  1,
                ],
                [
                  "Constituency",
                  selectedRecord
                    ? `${selectedRecord.number} — ${selectedRecord.name}`
                    : "Not chosen",
                  2,
                ],
                [
                  "Civic priorities",
                  priorities.length ? priorities.join(", ") : "None chosen",
                  3,
                ],
                [
                  "Political section",
                  politicalChoice === "yes"
                    ? politicalFactor || "Included; question not answered"
                    : "Not included",
                  4,
                ],
              ].map(([label, value, editIndex]) => (
                <div
                  className="grid gap-3 p-5 sm:grid-cols-[10rem_1fr_auto] sm:items-center"
                  key={String(label)}
                >
                  <dt className="text-sm font-bold text-[#0d2137]">{label}</dt>
                  <dd className="text-sm leading-6 text-slate-700">{value}</dd>
                  <dd>
                    <button
                      className="min-h-11 font-bold text-[#173a5e] underline decoration-[#b08d46] decoration-2 underline-offset-4"
                      onClick={() => setStageIndex(Number(editIndex))}
                      type="button"
                    >
                      Edit
                    </button>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 rounded-2xl border border-[#d8c9a5] bg-white p-5 text-sm leading-7 font-semibold text-[#0d2137]">
              Continuing only demonstrates the completion design. It does not
              confirm legal consent, create a participant record or send these
              choices anywhere.
            </p>
          </div>
        ) : null}

        {stageIndex === 6 ? (
          <div className="text-center">
            <div
              className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#e5efe8] text-2xl text-[#1d5c37]"
              aria-hidden="true"
            >
              ✓
            </div>
            <h2
              className="mt-6 scroll-mt-6 font-serif text-3xl font-bold text-[#0d2137] outline-none sm:text-4xl"
              id="preview-heading"
              tabIndex={-1}
            >
              Questionnaire preview complete
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-700">
              No real submission was made. No registration number, server
              receipt or participant record exists. Your choices remain only in
              this component’s temporary memory until you leave or restart.
            </p>
            <p className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[#d8c9a5] bg-[#fffaf0] p-5 text-sm font-bold text-[#7d2d1f]">
              Responses are not currently being accepted.
            </p>
          </div>
        ) : null}

        {stageIndex === 7 ? (
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-[#755a25] uppercase">
              Synthetic interface specification
            </p>
            <h2
              className="mt-4 scroll-mt-6 font-serif text-3xl font-bold text-[#0d2137] outline-none sm:text-4xl"
              id="preview-heading"
              tabIndex={-1}
            >
              Future receipt and withdrawal flow
            </h2>
            <p className="mt-4 max-w-3xl leading-8 text-slate-700">
              A production system would show a one-time, non-identifying receipt
              only after a secure server confirms acceptance. This preview
              intentionally creates no receipt value.
            </p>
            <ol className="mt-7 grid gap-4 md:grid-cols-3">
              <li className="rounded-2xl border border-[#d8c9a5] bg-[#fffdf7] p-5">
                <span className="text-xs font-bold text-[#755a25]">01</span>
                <h3 className="mt-3 font-bold text-[#0d2137]">
                  Store receipt safely
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  The participant would receive clear guidance that the project
                  cannot recover a lost secret.
                </p>
              </li>
              <li className="rounded-2xl border border-[#d8c9a5] bg-[#fffdf7] p-5">
                <span className="text-xs font-bold text-[#755a25]">02</span>
                <h3 className="mt-3 font-bold text-[#0d2137]">
                  Request withdrawal
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  A verified privacy channel would accept the receipt without
                  requesting political answers.
                </p>
              </li>
              <li className="rounded-2xl border border-[#d8c9a5] bg-[#fffdf7] p-5">
                <span className="text-xs font-bold text-[#755a25]">03</span>
                <h3 className="mt-3 font-bold text-[#0d2137]">
                  Confirm outcome
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  The production service would record suppression and provide an
                  auditable, non-disclosing status.
                </p>
              </li>
            </ol>
            <div className="mt-7 rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center">
              <p className="text-xs font-bold tracking-[0.14em] text-slate-600 uppercase">
                Future receipt area
              </p>
              <p className="mt-3 font-mono text-sm text-slate-500">
                No receipt generated in preview
              </p>
            </div>
            <button
              className="button-secondary mt-7"
              onClick={restart}
              type="button"
            >
              Clear choices and restart preview
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

        <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
          <button
            className="button-secondary disabled:cursor-not-allowed disabled:opacity-40"
            disabled={stageIndex === 0}
            onClick={() => {
              setError("");
              setStageIndex((current) => Math.max(0, current - 1));
            }}
            type="button"
          >
            ← Back
          </button>
          {stageIndex < stages.length - 1 ? (
            <button
              className="button-primary"
              onClick={continuePreview}
              type="button"
            >
              {stageIndex === 5
                ? "Show completion preview"
                : stageIndex === 6
                  ? "View future receipt flow"
                  : "Continue"}{" "}
              <span aria-hidden="true">→</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="border-t border-[#d8c9a5] bg-[#f6f1e5] px-5 py-4 text-xs leading-5 text-slate-600 sm:px-8">
        Design prototype · Browser-memory state only · No endpoint · No storage
        · No external AI
      </div>
    </section>
  );
}

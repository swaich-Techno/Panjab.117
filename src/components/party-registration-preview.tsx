"use client";

import { useState } from "react";

import { findCandidateRecord } from "@/lib/registration/candidates";
import {
  otherPartyChoices,
  partyCategories,
  type OtherPartyChoiceId,
  type PartyCategoryId,
} from "@/lib/registration/parties";
import type { RegistrationPreviewCopy } from "@/lib/registration/translations";

type SegmentOption = {
  number: number;
  name: string;
};

type PartyRegistrationPreviewProps = {
  copy: RegistrationPreviewCopy;
  locale: string;
  segments: readonly SegmentOption[];
};

export function PartyRegistrationPreview({
  copy,
  locale,
  segments,
}: PartyRegistrationPreviewProps) {
  const [segmentId, setSegmentId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<PartyCategoryId | null>(null);
  const [otherChoiceId, setOtherChoiceId] = useState<OtherPartyChoiceId | null>(
    null,
  );
  const [registrationConsent, setRegistrationConsent] = useState(false);
  const [politicalConsent, setPoliticalConsent] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const candidate =
    segmentId === null || categoryId === null
      ? null
      : findCandidateRecord(segmentId, categoryId);
  const selectedCategory = partyCategories.find(
    (category) => category.id === categoryId,
  );
  const isConfirmationReady =
    segmentId !== null &&
    selectedCategory?.enabled === true &&
    (categoryId !== "others" || otherChoiceId !== null) &&
    registrationConsent &&
    politicalConsent;

  function chooseCategory(nextCategory: PartyCategoryId) {
    setCategoryId(nextCategory);
    if (nextCategory !== "others") setOtherChoiceId(null);
    setConfirmation("");
    setError("");
  }

  function generateSyntheticConfirmation() {
    if (segmentId === null) {
      setError(copy.errorMissingSegment);
      return;
    }
    if (categoryId === null) {
      setError(copy.errorMissingParty);
      return;
    }
    const category = partyCategories.find((item) => item.id === categoryId);
    if (!category?.enabled) {
      setError(copy.errorMissingParty);
      return;
    }
    if (categoryId === "others" && otherChoiceId === null) {
      setError(copy.errorMissingOther);
      return;
    }
    if (!registrationConsent || !politicalConsent) {
      setError(copy.errorMissingConsent);
      return;
    }
    setError("");
    setConfirmation(
      `SYNTHETIC-${locale.toUpperCase()}-${segmentId}-${categoryId.toUpperCase()}`,
    );
  }

  function resetPreview() {
    setSegmentId(null);
    setCategoryId(null);
    setOtherChoiceId(null);
    setRegistrationConsent(false);
    setPoliticalConsent(false);
    setError("");
    setConfirmation("");
  }

  return (
    <section
      aria-labelledby="registration-preview-heading"
      className="mt-10 min-w-0 space-y-8 rounded-3xl border border-[#d8c9a5] bg-white p-5 shadow-[0_24px_70px_rgba(13,33,55,0.1)] sm:p-8"
      data-prototype-mode="synthetic-only"
    >
      <div>
        <p className="text-xs font-bold tracking-[0.15em] text-[#8b6c2f] uppercase">
          {copy.draftTranslation}
        </p>
        <h2
          className="mt-3 break-words font-serif text-3xl font-bold text-[#0d2137]"
          id="registration-preview-heading"
        >
          {copy.title}
        </h2>
        <p className="mt-4 max-w-3xl leading-7 text-slate-700">
          {copy.introduction}
        </p>
        <p className="mt-5 rounded-2xl border-2 border-[#b08d46] bg-[#fffaf0] p-4 text-sm leading-6 font-semibold text-[#0d2137]">
          {copy.syntheticOnly}
        </p>
      </div>

      <fieldset className="min-w-0 rounded-2xl border border-slate-300 p-5">
        <legend className="max-w-full break-words px-2 font-serif text-xl font-bold text-[#0d2137]">
          {copy.segmentLegend}
        </legend>
        <label
          className="mt-3 block text-sm font-semibold text-slate-700"
          htmlFor="registration-segment"
        >
          {copy.segmentPrompt}
        </label>
        <select
          className="mt-2 min-h-12 min-w-0 max-w-full w-full rounded-xl border border-slate-400 bg-white px-4 py-3 text-base text-slate-900 focus:outline-3 focus:outline-offset-2 focus:outline-emerald-700"
          id="registration-segment"
          onChange={(event) => {
            setSegmentId(
              event.target.value ? Number(event.target.value) : null,
            );
            setConfirmation("");
            setError("");
          }}
          value={segmentId ?? ""}
        >
          <option value="">{copy.segmentPrompt}</option>
          {segments.map((segment) => (
            <option key={segment.number} value={segment.number}>
              {segment.number} · {segment.name}
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset className="min-w-0 rounded-2xl border border-slate-300 p-5">
        <legend className="max-w-full break-words px-2 font-serif text-xl font-bold text-[#0d2137]">
          {copy.partyLegend}
        </legend>
        <p className="mt-3 text-sm text-slate-600">{copy.partyPrompt}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {partyCategories.map((category) => (
            <label
              className={`flex min-h-20 items-start gap-3 rounded-2xl border p-4 ${
                category.enabled
                  ? "cursor-pointer border-slate-300 bg-white"
                  : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
              }`}
              key={category.id}
            >
              <input
                checked={categoryId === category.id}
                className="mt-1 size-5 shrink-0 accent-[#173a5e]"
                disabled={!category.enabled}
                name="party-category"
                onChange={() => chooseCategory(category.id)}
                type="radio"
              />
              <span className="min-w-0 break-words">
                <span className="block font-bold">
                  {category.shortName} · {category.name}
                </span>
                {!category.enabled ? (
                  <span className="mt-1 block text-xs leading-5">
                    {copy.allianceUnavailable}
                  </span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-[#fffaf0] p-4 text-sm leading-6 text-slate-700">
          {copy.organisationNotice}
        </p>
        {categoryId === "others" ? (
          <div className="mt-5">
            <label
              className="block text-sm font-semibold text-slate-700"
              htmlFor="other-party-choice"
            >
              {copy.othersPrompt}
            </label>
            <select
              className="mt-2 min-h-12 min-w-0 max-w-full w-full rounded-xl border border-slate-400 bg-white px-4 py-3 text-base text-slate-900 focus:outline-3 focus:outline-offset-2 focus:outline-emerald-700"
              id="other-party-choice"
              onChange={(event) => {
                setOtherChoiceId(
                  (event.target.value as OtherPartyChoiceId) || null,
                );
                setConfirmation("");
                setError("");
              }}
              value={otherChoiceId ?? ""}
            >
              <option value="">{copy.othersPrompt}</option>
              {otherPartyChoices.map((choice) => (
                <option key={choice.id} value={choice.id}>
                  {choice.shortName} · {choice.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </fieldset>

      <section
        aria-live="polite"
        className="rounded-2xl border border-[#d8c9a5] bg-[#fffdf7] p-5"
      >
        <h3 className="font-serif text-xl font-bold text-[#0d2137]">
          {copy.candidateHeading}
        </h3>
        {candidate ? (
          <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            <p className="text-lg font-bold text-[#0d2137]">
              {candidate.candidateFullName}
            </p>
            <p>
              <strong>{copy.candidateStatus}:</strong>{" "}
              {candidate.announcementStatus === "officially_announced_by_party"
                ? copy.candidateStatusOfficial
                : copy.candidateStatusReported}
            </p>
            <p>
              <strong>{copy.lastVerified}:</strong>{" "}
              {candidate.lastVerificationDate}
            </p>
            <a
              className="inline-block font-bold text-[#173a5e] underline decoration-[#b08d46] decoration-2 underline-offset-4"
              href={candidate.sourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              {copy.source}
            </a>
          </div>
        ) : (
          <p className="mt-3 font-semibold text-slate-700">
            {copy.candidateNotAnnounced}
          </p>
        )}
      </section>

      <section className="rounded-2xl bg-[#0d2137] p-5 text-white sm:p-6">
        <h3 className="font-serif text-xl font-bold text-[#e6c56c]">
          {copy.capacityHeading}
        </h3>
        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
          <p>{copy.capacityNotice}</p>
          <p>{copy.privacyNotice}</p>
          <p>{copy.noPublicCounters}</p>
          <p>{copy.notRepresentative}</p>
        </div>
      </section>

      <fieldset className="min-w-0 rounded-2xl border border-slate-300 p-5">
        <legend className="max-w-full break-words px-2 font-serif text-xl font-bold text-[#0d2137]">
          {copy.consentHeading}
        </legend>
        <div className="mt-3 space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-300 p-4">
            <input
              checked={registrationConsent}
              className="mt-1 size-5 shrink-0 accent-[#173a5e]"
              onChange={(event) => {
                setRegistrationConsent(event.target.checked);
                setConfirmation("");
                setError("");
              }}
              type="checkbox"
            />
            <span className="text-sm leading-6 text-slate-700">
              {copy.registrationConsent}
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-300 p-4">
            <input
              checked={politicalConsent}
              className="mt-1 size-5 shrink-0 accent-[#173a5e]"
              onChange={(event) => {
                setPoliticalConsent(event.target.checked);
                setConfirmation("");
                setError("");
              }}
              type="checkbox"
            />
            <span className="text-sm leading-6 text-slate-700">
              {copy.politicalConsent}
            </span>
          </label>
        </div>
        <div className="mt-5 rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">
          <h3 className="font-bold text-[#0d2137]">
            {copy.opinionChoicesHeading}
          </h3>
          <p className="mt-1">{copy.opinionChoicesNotice}</p>
        </div>
      </fieldset>

      <div aria-live="assertive">
        {error ? (
          <p className="rounded-xl border border-red-700 bg-red-50 p-4 font-semibold text-red-900">
            {error}
          </p>
        ) : null}
      </div>

      {confirmation ? (
        <section
          aria-live="polite"
          className="rounded-2xl border-2 border-emerald-700 bg-emerald-50 p-5"
        >
          <h3 className="font-serif text-xl font-bold text-emerald-950">
            {copy.confirmationHeading}
          </h3>
          <p className="mt-2 text-sm leading-6 text-emerald-950">
            {copy.confirmationBody}
          </p>
          <p className="mt-3 break-all font-mono text-sm font-bold text-emerald-950">
            {confirmation}
          </p>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          className="button-primary disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!isConfirmationReady}
          onClick={generateSyntheticConfirmation}
          type="button"
        >
          {copy.generateConfirmation}
        </button>
        <button
          className="button-secondary"
          onClick={resetPreview}
          type="button"
        >
          {copy.reset}
        </button>
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";

import type { Constituency } from "@/data/constituencies";
import type { RegionalDictionary } from "@/lib/regional-translations";

type DirectoryCopy = Pick<
  RegionalDictionary,
  | "assemblySegment"
  | "clearSearch"
  | "noResults"
  | "officialNameNote"
  | "resultCount"
  | "scheduledCasteSeat"
  | "searchButton"
  | "searchLabel"
  | "searchPlaceholder"
>;

type ConstituencyDirectoryProps = {
  copy: DirectoryCopy;
  entries: readonly Constituency[];
};

export function filterConstituencies(
  entries: readonly Constituency[],
  query: string,
): readonly Constituency[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("en");
  if (!normalizedQuery) return entries;

  return entries.filter(
    ({ name, number }) =>
      name.toLocaleLowerCase("en").includes(normalizedQuery) ||
      String(number).includes(normalizedQuery),
  );
}

export function ConstituencyDirectory({
  copy,
  entries,
}: ConstituencyDirectoryProps) {
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const filteredEntries = useMemo(
    () => filterConstituencies(entries, query),
    [entries, query],
  );

  return (
    <div>
      <form
        className="rounded-2xl border border-[#d8c9a5] bg-white p-5 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(draftQuery);
        }}
        role="search"
      >
        <label
          className="block text-sm font-bold text-[#0d2137]"
          htmlFor="constituency-search"
        >
          {copy.searchLabel}
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            aria-controls="constituency-results"
            className="min-h-12 flex-1 rounded-xl border border-slate-400 bg-white px-4 text-base text-slate-950 outline-none focus-visible:border-[#0d2137] focus-visible:ring-3 focus-visible:ring-[#b08d46]/40"
            id="constituency-search"
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            type="search"
            value={draftQuery}
          />
          <button
            className="min-h-12 rounded-xl bg-[#0d2137] px-6 font-bold text-white hover:bg-[#173a5e] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#b08d46]"
            type="submit"
          >
            {copy.searchButton}
          </button>
          {query ? (
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-400 px-5 font-bold text-[#0d2137] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#b08d46]"
              onClick={() => {
                setDraftQuery("");
                setQuery("");
              }}
              type="button"
            >
              {copy.clearSearch}
            </button>
          ) : null}
        </div>
      </form>

      <p aria-live="polite" className="mt-8 text-sm font-bold text-slate-700">
        {filteredEntries.length} {copy.resultCount}
      </p>
      {filteredEntries.length ? (
        <ol
          className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          id="constituency-results"
        >
          {filteredEntries.map((entry) => (
            <li
              className="rounded-2xl border border-[#dfd4b9] bg-[#fffdf7] p-5"
              key={entry.number}
            >
              <p className="text-xs font-bold tracking-[0.14em] text-[#8b6c2f] uppercase">
                {copy.assemblySegment} {entry.number}
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-[#0d2137]">
                {entry.name}
              </h2>
              <p className="mt-2 text-xs text-slate-500">
                {copy.officialNameNote}
              </p>
              {entry.reservedForScheduledCastes ? (
                <p className="mt-4 w-fit rounded-full bg-[#efe3bd] px-3 py-1 text-xs font-bold text-[#5e471d]">
                  {copy.scheduledCasteSeat}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p
          className="mt-5 rounded-2xl border border-[#dfd4b9] bg-white p-6 text-slate-700"
          id="constituency-results"
        >
          {copy.noResults}
        </p>
      )}
    </div>
  );
}

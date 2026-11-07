"use client";

import { useId, useMemo, useState } from "react";

import { regions, type Constituency, type Region } from "@/data/constituencies";
import type { Locale } from "@/lib/i18n";
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
  locale?: Locale;
  showRegionFilter?: boolean;
};

const regionLabels: Record<Region, string> = {
  majha: "Majha",
  malwa: "Malwa",
  doaba: "Doaba",
  puadh: "Puadh",
};

export function filterConstituencies(
  entries: readonly Constituency[],
  query: string,
  region: Region | "all" = "all",
): readonly Constituency[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("en");
  return entries.filter(({ name, number, proposedRegion }) => {
    const matchesRegion = region === "all" || proposedRegion === region;
    const matchesQuery =
      !normalizedQuery ||
      name.toLocaleLowerCase("en").includes(normalizedQuery) ||
      String(number).includes(normalizedQuery);
    return matchesRegion && matchesQuery;
  });
}

export function ConstituencyDirectory({
  copy,
  entries,
  locale = "en",
  showRegionFilter = false,
}: ConstituencyDirectoryProps) {
  const searchId = useId();
  const regionId = useId();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region | "all">("all");
  const filteredEntries = useMemo(
    () => filterConstituencies(entries, query, region),
    [entries, query, region],
  );

  return (
    <div>
      <div
        aria-label="Filter the constituency directory"
        className="grid gap-4 rounded-3xl border border-[#d8c9a5] bg-white p-5 shadow-[0_16px_50px_rgba(13,33,55,0.08)] sm:p-6 lg:grid-cols-[1fr_15rem_auto] lg:items-end"
        role="search"
      >
        <div>
          <label
            className="block text-sm font-bold text-[#0d2137]"
            htmlFor={searchId}
          >
            {copy.searchLabel}
          </label>
          <input
            aria-controls="constituency-results"
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-400 bg-white px-4 text-base text-slate-950 outline-none focus-visible:border-[#0d2137] focus-visible:ring-3 focus-visible:ring-[#b08d46]/40"
            id={searchId}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            type="search"
            value={query}
          />
        </div>
        {showRegionFilter ? (
          <div>
            <label
              className="block text-sm font-bold text-[#0d2137]"
              htmlFor={regionId}
            >
              Provisional cultural region
            </label>
            <select
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-400 bg-white px-4 text-base text-slate-950 outline-none focus-visible:border-[#0d2137] focus-visible:ring-3 focus-visible:ring-[#b08d46]/40"
              id={regionId}
              onChange={(event) =>
                setRegion(event.target.value as Region | "all")
              }
              value={region}
            >
              <option value="all">All regions</option>
              {regions.map((item) => (
                <option key={item} value={item}>
                  {regionLabels[item]}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <button
          className="button-secondary min-h-12 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!query && region === "all"}
          onClick={() => {
            setQuery("");
            setRegion("all");
          }}
          type="button"
        >
          {copy.clearSearch}
        </button>
      </div>

      <p aria-live="polite" className="mt-8 text-sm font-bold text-slate-700">
        {filteredEntries.length} {copy.resultCount}
      </p>
      {filteredEntries.length ? (
        <ol
          className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          id="constituency-results"
        >
          {filteredEntries.map((entry) => (
            <li className="constituency-card-item" key={entry.number}>
              <a
                className="group flex h-full min-h-48 flex-col rounded-2xl border border-[#dfd4b9] bg-[#fffdf7] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b08d46] hover:shadow-lg focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#b08d46] motion-reduce:transform-none motion-reduce:transition-none"
                href={`/${locale}/constituencies/${entry.slug}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs font-bold tracking-[0.14em] text-[#755a25] uppercase">
                    {copy.assemblySegment} {entry.number}
                  </p>
                  {entry.reservedForScheduledCastes ? (
                    <span className="rounded-full bg-[#efe3bd] px-3 py-1 text-[0.7rem] font-bold text-[#5e471d]">
                      SC
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 break-words font-serif text-2xl font-bold text-[#0d2137]">
                  {entry.name}
                </h3>
                <p className="mt-2 text-xs text-slate-600">
                  {copy.officialNameNote}
                </p>
                <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                  <p className="text-xs font-semibold text-slate-600">
                    {regionLabels[entry.proposedRegion]} · provisional region
                  </p>
                  <span
                    aria-hidden="true"
                    className="text-xl text-[#8b6c2f] transition group-hover:translate-x-1 motion-reduce:transform-none"
                  >
                    →
                  </span>
                </div>
              </a>
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

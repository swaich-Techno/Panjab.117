import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  constituencySources,
  getConstituenciesByRegion,
  isRegion,
  regions,
} from "@/data/constituencies";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale, locales } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/public-site";
import { getRegionalDictionary } from "@/lib/regional-translations";
import { getDictionary } from "@/lib/translations";

type RegionPageProps = {
  params: Promise<{ locale: string; region: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    regions.map((region) => ({ locale, region })),
  );
}

export async function generateMetadata({
  params,
}: RegionPageProps): Promise<Metadata> {
  const { locale, region } = await params;
  if (!isLocale(locale) || !isRegion(region)) return {};
  const t = getRegionalDictionary(locale);
  return {
    title: `${t.regions[region].name} | Panjab 117`,
    description: t.directoryBody,
    alternates: {
      languages: localizedAlternates(`/regions/${region}`),
    },
  };
}

export default async function RegionPage({
  params,
  searchParams,
}: RegionPageProps) {
  const { locale, region } = await params;
  if (!isLocale(locale) || !isRegion(region)) notFound();

  const queryValue = (await searchParams).q;
  const query =
    (Array.isArray(queryValue) ? queryValue[0] : queryValue)?.trim() ?? "";
  const normalizedQuery = query.toLocaleLowerCase("en");
  const allEntries = getConstituenciesByRegion(region);
  const entries = allEntries.filter(
    ({ name, number }) =>
      !normalizedQuery ||
      name.toLocaleLowerCase("en").includes(normalizedQuery) ||
      String(number).includes(normalizedQuery),
  );
  const t = getRegionalDictionary(locale);
  const base = getDictionary(locale);
  const regionCopy = t.regions[region];

  return (
    <>
      <SiteHeader dictionary={base} locale={locale} />
      <main className="min-h-screen bg-[#f8f4e9]" id="main-content">
        <section className="border-b border-[#d8c9a5] bg-[#0d2137] text-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <Link
              className="text-sm font-bold text-[#e6c56c] underline-offset-4 hover:underline"
              href={`/${locale}`}
            >
              ← {t.backHome}
            </Link>
            <p className="mt-10 text-xs font-bold tracking-[0.18em] text-[#e6c56c] uppercase">
              {t.directoryEyebrow}
            </p>
            <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight sm:text-6xl">
              {regionCopy.name} {t.directoryTitle}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
              {t.directoryBody}
            </p>
            <p className="mt-8 max-w-3xl rounded-2xl border border-[#e6c56c]/40 bg-white/5 p-5 text-sm leading-6 text-[#fff4cf]">
              <strong>{t.reviewBadge}.</strong> {t.classificationNotice}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <form
            className="rounded-2xl border border-[#d8c9a5] bg-white p-5 shadow-sm"
            method="get"
            role="search"
          >
            <label
              className="block text-sm font-bold text-[#0d2137]"
              htmlFor="constituency-search"
            >
              {t.searchLabel}
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                className="min-h-12 flex-1 rounded-xl border border-slate-400 bg-white px-4 text-base text-slate-950 outline-none focus-visible:border-[#0d2137] focus-visible:ring-3 focus-visible:ring-[#b08d46]/40"
                defaultValue={query}
                id="constituency-search"
                name="q"
                placeholder={t.searchPlaceholder}
                type="search"
              />
              <button
                className="min-h-12 rounded-xl bg-[#0d2137] px-6 font-bold text-white hover:bg-[#173a5e] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#b08d46]"
                type="submit"
              >
                {t.searchButton}
              </button>
              {query ? (
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-400 px-5 font-bold text-[#0d2137] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#b08d46]"
                  href={`/${locale}/regions/${region}`}
                >
                  {t.clearSearch}
                </Link>
              ) : null}
            </div>
          </form>

          <p
            aria-live="polite"
            className="mt-8 text-sm font-bold text-slate-700"
          >
            {entries.length} {t.resultCount}
          </p>
          {entries.length ? (
            <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => (
                <li
                  className="rounded-2xl border border-[#dfd4b9] bg-[#fffdf7] p-5"
                  key={entry.number}
                >
                  <p className="text-xs font-bold tracking-[0.14em] text-[#8b6c2f] uppercase">
                    {t.assemblySegment} {entry.number}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl font-bold text-[#0d2137]">
                    {entry.name}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    {t.officialNameNote}
                  </p>
                  {entry.reservedForScheduledCastes ? (
                    <p className="mt-4 w-fit rounded-full bg-[#efe3bd] px-3 py-1 text-xs font-bold text-[#5e471d]">
                      {t.scheduledCasteSeat}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-5 rounded-2xl border border-[#dfd4b9] bg-white p-6 text-slate-700">
              {t.noResults}
            </p>
          )}

          <aside className="mt-12 rounded-2xl border border-[#d8c9a5] bg-white p-6">
            <h2 className="font-serif text-2xl font-bold text-[#0d2137]">
              {t.sources}
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              {Object.values(constituencySources).map((source) => (
                <li key={source.url}>
                  <a
                    className="font-semibold underline decoration-[#b08d46] decoration-2 underline-offset-4 hover:text-[#173a5e]"
                    href={source.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </main>
      <SiteFooter dictionary={base} />
    </>
  );
}

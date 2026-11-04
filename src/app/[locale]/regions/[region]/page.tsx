import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConstituencyDirectory } from "@/components/constituency-directory";
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

export default async function RegionPage({ params }: RegionPageProps) {
  const { locale, region } = await params;
  if (!isLocale(locale) || !isRegion(region)) notFound();

  const entries = getConstituenciesByRegion(region);
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
          <ConstituencyDirectory
            copy={{
              assemblySegment: t.assemblySegment,
              clearSearch: t.clearSearch,
              noResults: t.noResults,
              officialNameNote: t.officialNameNote,
              resultCount: t.resultCount,
              scheduledCasteSeat: t.scheduledCasteSeat,
              searchButton: t.searchButton,
              searchLabel: t.searchLabel,
              searchPlaceholder: t.searchPlaceholder,
            }}
            entries={entries}
          />

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

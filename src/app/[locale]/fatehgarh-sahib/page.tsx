import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  fatehgarhSahibParliamentaryGroup,
  fatehgarhSahibSegments,
} from "@/data/fatehgarh-sahib";
import { isLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/public-site";
import { getRegionalDictionary } from "@/lib/regional-translations";
import { getDictionary } from "@/lib/translations";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getRegionalDictionary(locale);
  return {
    title: `${t.fatehgarhTitle} | Panjab 117`,
    description: t.fatehgarhBody,
    alternates: {
      canonical: localizedAlternates("/fatehgarh-sahib").en,
    },
  };
}

export default async function FatehgarhSahibPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getRegionalDictionary(locale);
  const base = getDictionary(locale);

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
            <p className="mt-10 text-xs font-bold tracking-[0.16em] text-[#e6c56c] uppercase">
              {t.fatehgarhEyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl break-words font-serif text-4xl leading-tight font-bold tracking-tight sm:text-6xl">
              {t.fatehgarhTitle}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
              {t.fatehgarhBody}
            </p>
            <p className="mt-6 max-w-3xl text-sm leading-6 text-[#fff4cf]">
              {t.parliamentaryIndependence}
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fatehgarhSahibSegments.map((segment) => (
              <li
                className="rounded-2xl border border-[#d8c9a5] bg-[#fffdf7] p-6 shadow-sm"
                key={segment.number}
              >
                <p className="text-xs font-bold tracking-[0.14em] text-[#8b6c2f] uppercase">
                  {t.assemblySegment} {segment.number}
                </p>
                <h2 className="mt-3 font-serif text-2xl font-bold text-[#0d2137]">
                  {segment.name}
                </h2>
                {segment.reservedForScheduledCastes ? (
                  <p className="mt-4 text-sm font-semibold text-[#755a25]">
                    {t.scheduledCasteSeat}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col items-start gap-5 rounded-2xl border border-[#d8c9a5] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-slate-700">
              {t.sources}:{" "}
              <a
                className="font-bold underline decoration-[#b08d46] decoration-2 underline-offset-4"
                href={fatehgarhSahibParliamentaryGroup.source.url}
                rel="noreferrer"
                target="_blank"
              >
                {fatehgarhSahibParliamentaryGroup.source.label}
              </a>
            </p>
            <Link
              className="button-primary shrink-0"
              href={`/${locale}/fatehgarh-sahib/survey`}
            >
              {t.surveyPreview} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter dictionary={base} />
    </>
  );
}

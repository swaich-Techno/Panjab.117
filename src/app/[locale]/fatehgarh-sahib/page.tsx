import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  fatehgarhSahibParliamentaryGroup,
  fatehgarhSahibSegments,
} from "@/data/fatehgarh-sahib";
import { isLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/translations";

type PageProps = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: "Fatehgarh Sahib parliamentary project | Panjab 117",
  description:
    "A read-only research overview of the nine Assembly segments in the Fatehgarh Sahib parliamentary constituency.",
  alternates: { canonical: "/en/fatehgarh-sahib/" },
};

export default async function FatehgarhSahibPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <SiteHeader dictionary={t} locale={locale} />
      <main className="min-h-screen bg-[#f8f4e9]" id="main-content">
        <section className="relative overflow-hidden border-b border-[#284963] bg-[#0d2137] text-white">
          <div className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-[#e6c56c]/10 blur-3xl" />
          <div className="relative mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <a
              className="text-sm font-bold text-[#e6c56c] underline-offset-4 hover:underline"
              href="/en/"
            >
              ← Panjab 117 home
            </a>
            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-end">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-[#e6c56c] uppercase">
                  Parliamentary constituency 8 · Scheduled Castes reserved
                </p>
                <h1 className="mt-4 max-w-5xl break-words font-serif text-5xl leading-tight font-bold tracking-[-0.035em] sm:text-7xl">
                  Fatehgarh Sahib research project
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
                  Nine verified Assembly segments, one transparent
                  civic-research design and no live response collection.
                </p>
              </div>
              <div className="rounded-3xl border border-white/20 bg-white/5 p-6">
                <p className="text-xs font-bold tracking-[0.14em] text-[#e6c56c] uppercase">
                  Planned collection date
                </p>
                <p className="mt-3 font-serif text-3xl font-bold">
                  10 November 2026
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Subject to explicit launch approval. The date cannot activate
                  collection.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#755a25] uppercase">
                Geographic scope
              </p>
              <h2 className="mt-4 font-serif text-4xl font-bold text-[#0d2137]">
                Nine Assembly segments
              </h2>
              <p className="mt-4 leading-8 text-slate-700">
                The parliamentary constituency contains the nine Assembly
                segments below. Fatehgarh Sahib district is a different
                administrative unit and contains three Assembly constituencies:
                Bassi Pathana, Fatehgarh Sahib and Amloh.
              </p>
            </div>
            <div className="rounded-3xl border border-[#d8c9a5] bg-white p-6 text-sm leading-7 text-slate-700">
              <strong className="text-[#0d2137]">
                Why the distinction matters:
              </strong>{" "}
              parliamentary, Assembly and district boundaries serve different
              purposes. This page never treats the district’s three seats as the
              complete parliamentary grouping.
            </div>
          </div>

          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fatehgarhSahibSegments.map((segment) => (
              <li key={segment.number}>
                <a
                  className="group flex h-full min-h-52 flex-col rounded-3xl border border-[#d8c9a5] bg-[#fffdf7] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#b08d46] hover:shadow-xl focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#b08d46] motion-reduce:transform-none motion-reduce:transition-none"
                  href={`/en/constituencies/${segment.slug}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-xs font-bold tracking-[0.14em] text-[#755a25] uppercase">
                      Assembly {segment.number}
                    </p>
                    {segment.reservedForScheduledCastes ? (
                      <span className="rounded-full bg-[#efe3bd] px-3 py-1 text-xs font-bold text-[#5e471d]">
                        SC
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-5 break-words font-serif text-3xl font-bold text-[#0d2137]">
                    {segment.name}
                  </h3>
                  <p className="mt-auto pt-7 text-sm font-bold text-[#173a5e]">
                    Open constituency profile{" "}
                    <span
                      aria-hidden="true"
                      className="inline-block transition group-hover:translate-x-1 motion-reduce:transform-none"
                    >
                      →
                    </span>
                  </p>
                </a>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-y border-[#d8c9a5] bg-[#efe6d2]">
          <div className="mx-auto grid max-w-[90rem] gap-6 px-5 py-16 sm:px-8 md:grid-cols-3 lg:px-12 lg:py-20">
            {[
              [
                "Method",
                "A neutral questionnaire separates local civic priorities from optional political opinion and documents non-probability recruitment limits.",
              ],
              [
                "Target",
                "At least 500 valid voluntary responses per Assembly segment, for a minimum research target of 4,500. There is no research-target maximum cap.",
              ],
              [
                "Privacy status",
                "Consent, secure production intake, withdrawal, recovery and accountable operations require approval before any genuine response is accepted.",
              ],
            ].map(([title, body]) => (
              <article
                className="rounded-3xl border border-[#d8c9a5] bg-white p-7"
                key={title}
              >
                <h2 className="font-serif text-2xl font-bold text-[#0d2137]">
                  {title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-700">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="grid gap-8 rounded-[2rem] bg-[#173a5e] p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#e6c56c] uppercase">
                Participation status
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold">
                Survey responses are not being accepted.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">
                The interactive questionnaire is a browser-memory-only design
                preview. It has no submission endpoint, receipt service,
                database or response storage.
              </p>
            </div>
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#e6c56c] px-6 font-bold text-[#0d2137] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white"
              href="/en/fatehgarh-sahib/survey"
            >
              Open survey preview
            </a>
          </div>
          <p className="mt-8 text-sm leading-7 text-slate-700">
            Source:{" "}
            <a
              className="font-bold underline decoration-[#b08d46] decoration-2 underline-offset-4"
              href={fatehgarhSahibParliamentaryGroup.source.url}
              rel="noreferrer"
              target="_blank"
            >
              {fatehgarhSahibParliamentaryGroup.source.label} ↗
            </a>{" "}
            · last checked {fatehgarhSahibParliamentaryGroup.source.lastChecked}
          </p>
        </section>
      </main>
      <SiteFooter dictionary={t} />
    </>
  );
}

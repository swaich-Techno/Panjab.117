import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SurveyPreview } from "@/components/survey-preview";
import { isLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/translations";

type PageProps = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: "Punjab 117-constituency survey design | Panjab 117",
  description:
    "A read-only statewide survey-interface preview covering all 117 Punjab Assembly constituencies.",
  alternates: { canonical: "/en/survey/" },
  robots: { index: false, follow: false },
};

export default async function StatewideSurveyPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <>
      <SiteHeader dictionary={t} locale={locale} />
      <main className="min-h-screen bg-[#f8f4e9]" id="main-content">
        <section className="bg-[#0d2137] text-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <a
              className="text-sm font-bold text-[#e6c56c] underline-offset-4 hover:underline"
              href="/en/"
            >
              ← Panjab 117 home
            </a>
            <p className="mt-10 text-xs font-bold tracking-[0.18em] text-[#e6c56c] uppercase">
              Statewide survey project · read-only design
            </p>
            <h1 className="mt-4 max-w-5xl font-serif text-5xl font-bold tracking-[-0.035em] sm:text-7xl">
              All 117 constituencies, one consistent experience
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
              The nine Fatehgarh Sahib segments are included in the statewide
              total—not added on top of it. Collection remains closed.
            </p>
            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/20 bg-white/5 p-5">
                <p className="text-3xl font-bold text-[#e6c56c]">117</p>
                <p className="mt-1 text-sm text-slate-200">
                  Assembly constituencies
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/5 p-5">
                <p className="text-3xl font-bold text-[#e6c56c]">500+</p>
                <p className="mt-1 text-sm text-slate-200">
                  Minimum target per constituency
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/5 p-5">
                <p className="text-3xl font-bold text-[#e6c56c]">58,500+</p>
                <p className="mt-1 text-sm text-slate-200">
                  Statewide minimum research target
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="mb-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-[#d8c9a5] bg-white p-7">
              <p className="text-xs font-bold tracking-[0.14em] text-[#755a25] uppercase">
                Planned start
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-[#0d2137]">
                15 November 2026
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                A planning date only. It cannot override legal, privacy,
                security, operations or final launch approvals.
              </p>
            </div>
            <div className="rounded-3xl border border-[#d8c9a5] bg-[#fffdf7] p-7">
              <p className="text-xs font-bold tracking-[0.14em] text-[#755a25] uppercase">
                Availability
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-[#0d2137]">
                Not open
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                No production intake service, participant storage, receipt
                service or live withdrawal channel is connected.
              </p>
            </div>
          </div>
          <SurveyPreview scope="statewide" />
        </section>
      </main>
      <SiteFooter dictionary={t} />
    </>
  );
}

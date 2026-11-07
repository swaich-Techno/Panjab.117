import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SurveyPreview } from "@/components/survey-preview";
import { isLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/translations";

type PageProps = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: "Fatehgarh Sahib survey preview | Panjab 117",
  description:
    "A read-only eight-screen English questionnaire design for the nine Fatehgarh Sahib Assembly segments.",
  alternates: { canonical: "/en/fatehgarh-sahib/survey/" },
  robots: { index: false, follow: false },
};

export default async function SurveyPreviewPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <SiteHeader dictionary={t} locale={locale} />
      <main className="min-h-screen bg-[#f8f4e9]" id="main-content">
        <section className="border-b border-[#d8c9a5] bg-[#fffdf7]">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
            <a
              className="text-sm font-bold text-[#173a5e] underline-offset-4 hover:underline"
              href="/en/fatehgarh-sahib"
            >
              ← Fatehgarh Sahib project
            </a>
            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_19rem] lg:items-end">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-[#755a25] uppercase">
                  English questionnaire · design prototype
                </p>
                <h1 className="mt-4 max-w-4xl break-words font-serif text-5xl leading-tight font-bold tracking-[-0.035em] text-[#0d2137] sm:text-6xl">
                  Fatehgarh Sahib survey preview
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
                  Explore the proposed eligibility, consent, constituency,
                  civic, optional political, review, completion and withdrawal
                  interfaces.
                </p>
              </div>
              <div className="rounded-3xl bg-[#0d2137] p-6 text-white">
                <p className="text-xs font-bold text-[#e6c56c] uppercase">
                  Current status
                </p>
                <p className="mt-3 font-serif text-2xl font-bold">Read-only</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  No responses accepted. Planned date: 10 November 2026, subject
                  to approval.
                </p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#d8c9a5] bg-white p-5">
                <p className="text-2xl font-bold text-[#0d2137]">9</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  Assembly segments
                </p>
              </div>
              <div className="rounded-2xl border border-[#d8c9a5] bg-white p-5">
                <p className="text-2xl font-bold text-[#0d2137]">500+</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  Intended minimum valid responses per segment
                </p>
              </div>
              <div className="rounded-2xl border border-[#d8c9a5] bg-white p-5">
                <p className="text-2xl font-bold text-[#0d2137]">4,500+</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  Research target, not a statistical guarantee
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <SurveyPreview scope="fatehgarh" />
          <aside className="mt-8 rounded-2xl border border-[#d8c9a5] bg-[#fffdf7] p-6 text-sm leading-7 text-slate-700">
            <strong className="text-[#0d2137]">Methodology notice.</strong> Any
            future voluntary responses would be analysed with explicit coverage
            and self-selection limitations. The 500-per-constituency target is a
            minimum research target, not a cap, representative sample claim or
            election prediction.
          </aside>
        </section>
      </main>
      <SiteFooter dictionary={t} />
    </>
  );
}

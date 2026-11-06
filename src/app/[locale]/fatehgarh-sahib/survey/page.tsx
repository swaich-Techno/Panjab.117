import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  SurveyPreview,
  type LocalizedPreviewQuestion,
} from "@/components/survey-preview";
import { isLocale } from "@/lib/i18n";
import {
  isPublicPreviewIndexingEnabled,
  localizedAlternates,
} from "@/lib/public-site";
import { getRegionalDictionary } from "@/lib/regional-translations";
import { CONSENT_NOTICE_VERSION, getConsentNotice } from "@/lib/survey/consent";
import { surveyPreviewCopy } from "@/lib/survey/preview-translations";
import {
  fatehgarhSahibQuestionnaire,
  QUESTIONNAIRE_VERSION,
} from "@/lib/survey/questionnaire";
import { getDictionary } from "@/lib/translations";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getRegionalDictionary(locale);
  const indexingEnabled = isPublicPreviewIndexingEnabled();
  return {
    title: `${t.surveyPreview} | ${t.fatehgarhTitle} | Panjab 117`,
    description: `${t.surveyBody} ${t.noIntake}`,
    alternates: {
      canonical: localizedAlternates("/fatehgarh-sahib/survey").en,
    },
    robots: {
      index: indexingEnabled,
      follow: indexingEnabled,
    },
  };
}

export default async function SurveyPreviewPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getRegionalDictionary(locale);
  const base = getDictionary(locale);
  const localizedQuestions: LocalizedPreviewQuestion[] =
    fatehgarhSahibQuestionnaire.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt[locale],
      helpText: "helpText" in question ? question.helpText[locale] : undefined,
      responseType: question.responseType,
      required: question.required,
      politicalOpinion: question.politicalOpinion,
      options: question.options.map((option) => ({
        id: option.id,
        label: option.label[locale],
      })),
    }));
  const notice = getConsentNotice(locale);

  return (
    <>
      <SiteHeader dictionary={base} locale={locale} />
      <main className="min-h-screen bg-[#f8f4e9]" id="main-content">
        <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:px-12 lg:py-24">
          <Link
            className="text-sm font-bold text-[#173a5e] underline-offset-4 hover:underline"
            href={`/${locale}/fatehgarh-sahib`}
          >
            ← {t.fatehgarhTitle}
          </Link>
          <p className="mt-10 text-xs font-bold tracking-[0.16em] text-[#8b6c2f] uppercase">
            {t.surveyEyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl break-words font-serif text-4xl leading-tight font-bold tracking-tight text-[#0d2137] sm:text-6xl">
            {t.surveyTitle}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
            {t.surveyBody}
          </p>

          <section
            aria-labelledby="availability-heading"
            className="mt-10 overflow-hidden rounded-3xl border border-[#d8c9a5] bg-white shadow-[0_20px_60px_rgba(13,33,55,0.08)]"
          >
            <div className="bg-[#0d2137] p-6 text-white sm:p-8">
              <p className="w-fit rounded-full bg-[#e6c56c] px-4 py-2 text-xs font-bold tracking-wide text-[#0d2137] uppercase">
                {t.draftStatus}
              </p>
              <h2
                className="mt-5 font-serif text-3xl font-bold"
                id="availability-heading"
              >
                {t.unavailable}
              </h2>
              <p className="mt-3 text-sm text-slate-300">{t.approvalGate}</p>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-xs font-bold tracking-wide text-[#8b6c2f] uppercase">
                {t.proposedWindow}
              </p>
              <p className="mt-2 max-w-3xl font-semibold leading-7 text-[#0d2137]">
                {t.surveyBody}
              </p>
            </div>
          </section>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <p className="rounded-2xl border border-[#d8c9a5] bg-[#fffdf7] p-6 text-sm leading-6 text-slate-700">
              <strong className="text-[#0d2137]">{t.proposedWindow}.</strong>{" "}
              {t.approvalGate}
            </p>
            <p className="rounded-2xl border border-[#d8c9a5] bg-[#fffdf7] p-6 text-sm leading-6 text-slate-700">
              {t.noIntake}
            </p>
          </div>
          <aside className="mt-8 rounded-2xl border border-[#d8c9a5] bg-[#fffdf7] p-6 text-sm leading-7 text-slate-700">
            <strong className="text-[#0d2137]">
              Development collection target, not a cap or statistical claim:
            </strong>{" "}
            if collection is independently approved later, the operational goal
            is at least 500 valid, retained and eligible voluntary responses
            from each of the nine Assembly segments. Responses above 500 would
            remain eligible. This is not a random sample, representative poll or
            election prediction.
          </aside>
          <SurveyPreview
            consent={notice}
            consentVersion={CONSENT_NOTICE_VERSION}
            copy={surveyPreviewCopy[locale]}
            questionnaireVersion={QUESTIONNAIRE_VERSION}
            questions={localizedQuestions}
          />
        </section>
      </main>
      <SiteFooter dictionary={base} />
    </>
  );
}

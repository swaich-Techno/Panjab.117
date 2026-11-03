import Link from "next/link";
import { notFound } from "next/navigation";

import { RegionCards } from "@/components/region-cards";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale } from "@/lib/i18n";
import { getRegionalDictionary } from "@/lib/regional-translations";
import { getDictionary } from "@/lib/translations";

type HomePageProps = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const regional = getRegionalDictionary(locale);
  const principles = [
    [t.principleOneTitle, t.principleOneBody],
    [t.principleTwoTitle, t.principleTwoBody],
    [t.principleThreeTitle, t.principleThreeBody],
  ] as const;

  return (
    <>
      <SiteHeader dictionary={t} locale={locale} />
      <main id="main-content">
        <section className="relative overflow-hidden border-b border-[#d8c9a5] bg-[#f8f4e9]">
          <div className="absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#d8bd73]/25 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-12 lg:py-28">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#8b6c2f] uppercase">
                {t.heroEyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl text-balance font-serif text-5xl leading-[1.04] font-bold tracking-[-0.035em] text-[#0d2137] sm:text-6xl lg:text-7xl">
                {t.heroTitle}
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
                {t.heroBody}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  className="button-primary"
                  href={`/${locale}#constituencies`}
                >
                  {t.heroPrimary}
                  <span aria-hidden="true">→</span>
                </Link>
                <Link className="button-secondary" href={`/${locale}#research`}>
                  {t.heroSecondary}
                </Link>
              </div>
            </div>
            <div
              className="relative mx-auto aspect-square w-full max-w-md"
              aria-label={`${t.identityValue} ${t.identityLabel}`}
            >
              <div className="absolute inset-0 rotate-3 rounded-[2.5rem] border border-[#b08d46]/30 bg-[#b08d46]" />
              <div className="absolute inset-3 -rotate-2 rounded-[2rem] border border-[#e6c56c]/30 bg-[#0d2137] p-8 text-white shadow-2xl sm:p-10">
                <p className="text-sm font-semibold tracking-wide text-slate-200">
                  {t.identityLabel}
                </p>
                <p className="mt-8 font-serif text-8xl leading-none font-bold tracking-[-0.06em] text-[#e6c56c] sm:text-9xl">
                  {t.identityValue}
                </p>
                <div className="mt-8 h-px bg-white/20" />
                <p className="mt-6 max-w-xs text-base leading-6 text-slate-200">
                  {t.identityCaption}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="scroll-mt-8 bg-[#fffdf7]" id="constituencies">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <SectionHeading
              eyebrow={regional.regionsEyebrow}
              title={regional.regionsTitle}
              body={regional.regionsBody}
            />
            <p className="mt-7 max-w-4xl rounded-2xl border border-[#d8c9a5] bg-[#f8f4e9] p-5 text-sm leading-6 text-slate-700">
              <strong className="text-[#0d2137]">
                {regional.reviewBadge}.
              </strong>{" "}
              {regional.classificationNotice}
            </p>
            <RegionCards dictionary={regional} locale={locale} />
            <div className="mt-8 rounded-2xl bg-[#0d2137] p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-8">
              <p className="max-w-3xl text-sm leading-6 text-slate-200">
                {regional.fatehgarhBody} {regional.parliamentaryIndependence}
              </p>
              <Link
                className="mt-5 inline-flex min-h-11 shrink-0 items-center rounded-full bg-[#e6c56c] px-5 py-2.5 text-sm font-bold text-[#0d2137] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white sm:mt-0"
                href={`/${locale}/fatehgarh-sahib`}
              >
                {regional.fatehgarhTitle}
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className="scroll-mt-8 bg-[#efe6d2]" id="survey">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="grid gap-12 rounded-[2rem] border border-[#d8c9a5] bg-[#fffaf0] p-7 sm:p-10 lg:grid-cols-[1fr_0.7fr] lg:p-14">
              <SectionHeading
                eyebrow={t.surveyEyebrow}
                title={t.surveyTitle}
                body={t.surveyBody}
              />
              <div className="flex flex-col justify-end gap-5 border-t border-[#d8c9a5] pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
                <p className="w-fit rounded-full bg-[#e6c56c] px-4 py-2 text-xs font-bold tracking-wider text-[#0d2137] uppercase">
                  {regional.draftStatus}
                </p>
                <p className="text-sm leading-6 font-semibold text-slate-700">
                  {regional.noIntake}
                </p>
                <Link
                  className="font-bold text-[#173a5e] underline decoration-[#b08d46] decoration-2 underline-offset-4"
                  href={`/${locale}/fatehgarh-sahib/survey`}
                >
                  {regional.surveyPreview} →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="scroll-mt-8 bg-[#081625] text-white" id="research">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <SectionHeading
              light
              eyebrow={t.researchEyebrow}
              title={t.researchTitle}
              body={t.researchBody}
            />
            <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-slate-700 bg-slate-700 md:grid-cols-3">
              {principles.map(([title, body], index) => (
                <li className="bg-[#081625] p-7 sm:p-9" key={title}>
                  <span className="font-serif text-4xl font-bold text-[#e6c56c]">
                    0{index + 1}
                  </span>
                  <h3 className="mt-8 text-xl font-bold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="scroll-mt-8 bg-[#173a5e] text-white" id="support">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12 lg:py-24">
            <SectionHeading
              light
              eyebrow={t.sponsorEyebrow}
              title={t.sponsorTitle}
              body={t.sponsorBody}
            />
            <div className="max-w-sm rounded-2xl border border-[#b08d46]/60 bg-[#0d2137]/50 p-6">
              <p className="font-bold text-white">{t.sponsorAction}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {t.sponsorNote}
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter dictionary={t} />
    </>
  );
}

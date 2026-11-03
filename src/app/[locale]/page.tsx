import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/translations";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale);
  const principles = [
    [t.principleOneTitle, t.principleOneBody],
    [t.principleTwoTitle, t.principleTwoBody],
    [t.principleThreeTitle, t.principleThreeBody],
  ] as const;

  return (
    <>
      <SiteHeader dictionary={t} locale={locale} />
      <main id="main-content">
        <section className="relative overflow-hidden border-b border-stone-200 bg-[#fbfaf6]">
          <div className="absolute top-0 right-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-amber-200/50 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-12 lg:py-28">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-emerald-800 uppercase">
                {t.heroEyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl text-balance font-serif text-5xl leading-[1.04] font-bold tracking-[-0.035em] text-stone-950 sm:text-6xl lg:text-7xl">
                {t.heroTitle}
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-stone-600 sm:text-xl">
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
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <div className="absolute inset-0 rotate-3 rounded-[2.5rem] border border-emerald-900/15 bg-emerald-900" />
              <div className="absolute inset-3 -rotate-2 rounded-[2rem] border border-amber-300/30 bg-[#183e34] p-8 text-white shadow-2xl sm:p-10">
                <p className="text-sm font-semibold tracking-wide text-emerald-100">
                  {t.identityLabel}
                </p>
                <p className="mt-8 font-serif text-8xl leading-none font-bold tracking-[-0.06em] text-amber-300 sm:text-9xl">
                  {t.identityValue}
                </p>
                <div className="mt-8 h-px bg-emerald-100/25" />
                <p className="mt-6 max-w-xs text-base leading-6 text-emerald-50">
                  {t.identityCaption}
                </p>
                <div
                  aria-hidden="true"
                  className="absolute right-8 bottom-8 grid grid-cols-3 gap-1.5"
                >
                  {Array.from({ length: 9 }).map((_, index) => (
                    <span
                      className="h-2 w-2 rounded-full bg-amber-300/70"
                      key={index}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="scroll-mt-8 bg-white" id="constituencies">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_0.75fr] lg:px-12 lg:py-28">
            <SectionHeading
              eyebrow={t.exploreEyebrow}
              title={t.exploreTitle}
              body={t.exploreBody}
            />
            <aside className="rounded-3xl border border-stone-200 bg-stone-50 p-7 sm:p-9">
              <span aria-hidden="true" className="text-3xl text-emerald-800">
                ⌖
              </span>
              <p className="mt-7 text-xl font-bold text-stone-900">
                {t.exploreAction}
              </p>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                {t.exploreNote}
              </p>
              <div className="mt-8 flex gap-1" aria-hidden="true">
                <span className="h-1.5 w-16 rounded-full bg-emerald-800" />
                <span className="h-1.5 w-8 rounded-full bg-amber-400" />
                <span className="h-1.5 w-4 rounded-full bg-stone-300" />
              </div>
            </aside>
          </div>
        </section>

        <section className="scroll-mt-8 bg-amber-50" id="survey">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="grid gap-12 rounded-[2rem] border border-amber-200 bg-[#fffaf0] p-7 sm:p-10 lg:grid-cols-[1fr_0.7fr] lg:p-14">
              <SectionHeading
                eyebrow={t.surveyEyebrow}
                title={t.surveyTitle}
                body={t.surveyBody}
              />
              <div className="flex flex-col justify-end gap-5 border-t border-amber-200 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
                <p className="w-fit rounded-full bg-amber-200 px-4 py-2 text-xs font-bold tracking-wider text-amber-950 uppercase">
                  {t.surveyStatus}
                </p>
                <p className="text-sm leading-6 font-semibold text-stone-700">
                  {t.surveyPrivacy}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="scroll-mt-8 bg-stone-950 text-white" id="research">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <SectionHeading
              light
              eyebrow={t.researchEyebrow}
              title={t.researchTitle}
              body={t.researchBody}
            />
            <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-stone-800 bg-stone-800 md:grid-cols-3">
              {principles.map(([title, body], index) => (
                <li className="bg-stone-950 p-7 sm:p-9" key={title}>
                  <span className="font-serif text-4xl font-bold text-amber-300">
                    0{index + 1}
                  </span>
                  <h3 className="mt-8 text-xl font-bold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-400">
                    {body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="scroll-mt-8 bg-emerald-900 text-white" id="support">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12 lg:py-24">
            <SectionHeading
              light
              eyebrow={t.sponsorEyebrow}
              title={t.sponsorTitle}
              body={t.sponsorBody}
            />
            <div className="max-w-sm rounded-2xl border border-emerald-700 bg-emerald-950/30 p-6">
              <p className="font-bold text-emerald-50">{t.sponsorAction}</p>
              <p className="mt-2 text-sm leading-6 text-emerald-200">
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

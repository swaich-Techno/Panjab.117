import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  constituencies,
  constituencySources,
  getConstituencyBySlug,
  getParliamentaryConstituency,
} from "@/data/constituencies";
import { BRAND_NAME, STATE_NAME } from "@/lib/branding";
import { isLocale, locales } from "@/lib/i18n";
import { getDictionary } from "@/lib/translations";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

const regionLabels = {
  majha: "Majha",
  malwa: "Malwa",
  doaba: "Doaba",
  puadh: "Puadh",
} as const;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    constituencies.map(({ slug }) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const constituency = getConstituencyBySlug(slug);
  if (!isLocale(locale) || !constituency) return {};
  return {
    title: `${constituency.number} ${constituency.name} | ${BRAND_NAME}`,
    description: `Verified public-reference profile for ${STATE_NAME} Assembly constituency ${constituency.number}, ${constituency.name}.`,
    alternates: { canonical: `/en/constituencies/${constituency.slug}/` },
  };
}

export default async function ConstituencyProfilePage({ params }: PageProps) {
  const { locale, slug } = await params;
  const constituency = getConstituencyBySlug(slug);
  if (!isLocale(locale) || !constituency) notFound();
  const t = getDictionary(locale);
  const parliamentary = getParliamentaryConstituency(
    constituency.parliamentaryConstituencyNumber,
  );
  if (!parliamentary) notFound();
  const previous = constituencies[constituency.number - 2];
  const next = constituencies[constituency.number];

  return (
    <>
      <SiteHeader dictionary={t} locale={locale} />
      <main className="min-h-screen bg-[#f8f4e9]" id="main-content">
        <section className="border-b border-[#284963] bg-[#0d2137] text-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <a
              className="text-sm font-bold text-[#e6c56c] underline-offset-4 hover:underline"
              href="/en/#constituencies"
            >
              ← All constituencies
            </a>
            <p className="mt-10 text-xs font-bold tracking-[0.18em] text-[#e6c56c] uppercase">
              {STATE_NAME} Assembly constituency {constituency.number}
            </p>
            <h1 className="mt-4 break-words font-serif text-5xl font-bold tracking-[-0.035em] sm:text-7xl">
              {constituency.name}
            </h1>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold">
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2">
                Assembly no. {constituency.number}
              </span>
              {constituency.reservedForScheduledCastes ? (
                <span className="rounded-full bg-[#e6c56c] px-4 py-2 text-[#0d2137]">
                  Scheduled Castes reserved seat
                </span>
              ) : (
                <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2">
                  General seat
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:px-12 lg:py-20">
          <div className="space-y-8">
            <section className="rounded-3xl border border-[#d8c9a5] bg-white p-7 shadow-sm sm:p-9">
              <p className="text-xs font-bold tracking-[0.16em] text-[#755a25] uppercase">
                Verified electoral context
              </p>
              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold text-slate-600 uppercase">
                    Official English name
                  </dt>
                  <dd className="mt-2 text-lg font-bold text-[#0d2137]">
                    {constituency.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-600 uppercase">
                    Parliamentary constituency
                  </dt>
                  <dd className="mt-2 text-lg font-bold text-[#0d2137]">
                    {parliamentary.number} — {parliamentary.name}
                    {parliamentary.reservedForScheduledCastes ? " (SC)" : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-600 uppercase">
                    Cultural-region index
                  </dt>
                  <dd className="mt-2 text-lg font-bold text-[#0d2137]">
                    {regionLabels[constituency.proposedRegion]}{" "}
                    <span className="block text-sm font-normal text-slate-600">
                      Provisional editorial label; not an official electoral
                      boundary.
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-600 uppercase">
                    Record status
                  </dt>
                  <dd className="mt-2 text-lg font-bold text-[#0d2137]">
                    Boundary reference verified{" "}
                    <span className="block text-sm font-normal text-slate-600">
                      Local descriptive research is still being prepared.
                    </span>
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-[#d8c9a5] bg-[#fffdf7] p-7 sm:p-9">
              <p className="text-xs font-bold tracking-[0.16em] text-[#755a25] uppercase">
                Local civic priorities
              </p>
              <h2 className="mt-4 font-serif text-3xl font-bold text-[#0d2137]">
                Constituency research is being prepared.
              </h2>
              <p className="mt-4 max-w-3xl leading-8 text-slate-700">
                No local issue, representative, candidate, election result or
                survey finding is published here without a verified source and
                editorial review.
              </p>
            </section>

            <section className="rounded-3xl border border-[#d8c9a5] bg-white p-7 sm:p-9">
              <p className="text-xs font-bold tracking-[0.16em] text-[#755a25] uppercase">
                Survey eligibility & status
              </p>
              <h2 className="mt-4 font-serif text-3xl font-bold text-[#0d2137]">
                Responses are not being accepted.
              </h2>
              <p className="mt-4 leading-8 text-slate-700">
                A future statewide survey is planned for eligible adult
                residents, subject to separate privacy, security, methodology,
                operations and launch approvals. The intended research target is
                at least 500 valid voluntary responses per Assembly
                constituency; it is not a quota ceiling or a guarantee of
                statistical representativeness.
              </p>
              <a className="button-secondary mt-7" href="/en/survey">
                View the statewide survey design
              </a>
            </section>
          </div>

          <aside className="space-y-6">
            {parliamentary.number === 8 ? (
              <div className="rounded-3xl bg-[#173a5e] p-6 text-white">
                <p className="text-xs font-bold tracking-[0.14em] text-[#e6c56c] uppercase">
                  Featured pilot area
                </p>
                <h2 className="mt-3 font-serif text-2xl font-bold">
                  Fatehgarh Sahib project
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  This constituency is one of the nine verified Assembly
                  segments in the parliamentary project.
                </p>
                <a
                  className="mt-5 inline-flex font-bold text-[#e6c56c] underline underline-offset-4"
                  href="/en/fatehgarh-sahib"
                >
                  Open the nine-segment overview →
                </a>
              </div>
            ) : null}
            <div className="rounded-3xl border border-[#d8c9a5] bg-white p-6">
              <h2 className="font-serif text-2xl font-bold text-[#0d2137]">
                Primary source
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Names, numbers, reservations and parliamentary associations
                follow Election Commission of India Delimitation Order No. 22.
              </p>
              <a
                className="mt-4 inline-flex font-bold text-[#173a5e] underline decoration-[#b08d46] decoration-2 underline-offset-4"
                href={constituencySources.officialBoundaries.url}
                rel="noreferrer"
                target="_blank"
              >
                Open ECI delimitation records ↗
              </a>
              <p className="mt-4 text-xs text-slate-600">
                Record version:{" "}
                {constituencySources.officialBoundaries.recordVersion}
                <br />
                Last checked:{" "}
                {constituencySources.officialBoundaries.lastChecked}
              </p>
            </div>
          </aside>
        </section>

        <nav
          aria-label="Adjacent constituencies"
          className="border-t border-[#d8c9a5] bg-[#efe6d2]"
        >
          <div className="mx-auto grid max-w-6xl gap-4 px-5 py-8 sm:grid-cols-2 sm:px-8 lg:px-12">
            {previous ? (
              <a
                className="rounded-2xl border border-[#d8c9a5] bg-white p-5 font-bold text-[#0d2137] focus-visible:outline-3 focus-visible:outline-[#b08d46]"
                href={`/en/constituencies/${previous.slug}`}
              >
                ← {previous.number} {previous.name}
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a
                className="rounded-2xl border border-[#d8c9a5] bg-white p-5 text-right font-bold text-[#0d2137] focus-visible:outline-3 focus-visible:outline-[#b08d46]"
                href={`/en/constituencies/${next.slug}`}
              >
                {next.number} {next.name} →
              </a>
            ) : null}
          </div>
        </nav>
      </main>
      <SiteFooter dictionary={t} />
    </>
  );
}

import { notFound } from "next/navigation";

import { ConstituencyDirectory } from "@/components/constituency-directory";
import { RegionCards } from "@/components/region-cards";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { constituencies } from "@/data/constituencies";
import { isLocale } from "@/lib/i18n";
import { getRegionalDictionary } from "@/lib/regional-translations";
import { getDictionary } from "@/lib/translations";

type HomePageProps = { params: Promise<{ locale: string }> };

const methods = [
  [
    "01",
    "Verify sources",
    "Names, numbers, seat reservations and electoral groupings are checked against primary public records.",
  ],
  [
    "02",
    "Ask neutrally",
    "Question wording separates civic priorities from optional political opinion and always permits non-response.",
  ],
  [
    "03",
    "Protect participants",
    "Consent, data minimisation, withdrawal and secure operations are mandatory before any real collection.",
  ],
  [
    "04",
    "Report limitations",
    "Voluntary, non-probability recruitment cannot be presented as representative polling or an election forecast.",
  ],
  [
    "05",
    "Correct openly",
    "Uncertainty, provisional classifications and meaningful revisions stay visible to readers.",
  ],
] as const;

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const regional = getRegionalDictionary(locale);

  return (
    <>
      <SiteHeader dictionary={t} locale={locale} />
      <main id="main-content">
        <section className="relative overflow-hidden border-b border-[#d8c9a5] bg-[#f8f4e9]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(230,197,108,0.35),transparent_28%),linear-gradient(120deg,transparent_60%,rgba(13,33,55,0.04))]" />
          <div className="relative mx-auto grid max-w-[90rem] gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-12 lg:py-28">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#755a25] uppercase">
                Independent civic research · Punjab
              </p>
              <h1 className="mt-6 max-w-5xl text-balance font-serif text-5xl leading-[1.02] font-bold tracking-[-0.045em] text-[#0d2137] sm:text-6xl lg:text-7xl">
                Panjab 117 — Understanding Punjab, Constituency by Constituency
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-700 sm:text-xl">
                Independent civic research, constituency information and a
                transparent approach to understanding local priorities across
                Punjab.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a className="button-primary" href="#constituencies">
                  Explore constituencies <span aria-hidden="true">→</span>
                </a>
                <a
                  className="button-secondary"
                  href="/en/fatehgarh-sahib/survey"
                >
                  View survey preview
                </a>
              </div>
              <p className="mt-6 flex max-w-2xl items-start gap-3 rounded-2xl border border-[#c9af6a] bg-white/75 p-4 text-sm leading-6 font-semibold text-[#5f2d23]">
                <span
                  aria-hidden="true"
                  className="mt-1 size-2 shrink-0 rounded-full bg-[#a33a28]"
                />
                Survey collection is not open. This website does not accept,
                transmit or store responses.
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-lg">
              <div className="rounded-[2.25rem] bg-[#0d2137] p-7 text-white shadow-[0_28px_80px_rgba(13,33,55,0.25)] sm:p-10">
                <p className="text-xs font-bold tracking-[0.18em] text-[#e6c56c] uppercase">
                  Punjab Legislative Assembly
                </p>
                <p className="mt-7 font-serif text-[7rem] leading-none font-bold tracking-[-0.08em] text-white sm:text-[9rem]">
                  117
                </p>
                <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/15">
                  <div className="bg-[#173a5e] p-5">
                    <p className="text-3xl font-bold text-[#e6c56c]">13</p>
                    <p className="mt-1 text-xs text-slate-200">
                      Parliamentary constituencies
                    </p>
                  </div>
                  <div className="bg-[#173a5e] p-5">
                    <p className="text-3xl font-bold text-[#e6c56c]">4</p>
                    <p className="mt-1 text-xs text-slate-200">
                      Provisional cultural regions
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-sm leading-6 text-slate-300">
                  Official electoral records are kept distinct from provisional
                  editorial region labels.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="scroll-mt-8 bg-[#fffdf7]" id="constituencies">
          <div className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <SectionHeading
                eyebrow="Constituency directory"
                title="Explore all 117 Assembly constituencies."
                body="Search by official English name or constituency number, then open a static profile sourced from the shared verified record."
              />
              <p className="rounded-2xl border border-[#d8c9a5] bg-[#f8f4e9] p-5 text-sm leading-7 text-slate-700">
                <strong className="text-[#0d2137]">
                  Important distinction.
                </strong>{" "}
                Assembly constituency boundaries and names are official
                electoral records. Majha, Malwa, Doaba and Puadh are provisional
                cultural-region labels used only for navigation and require
                local review.
              </p>
            </div>
            <div className="mt-12">
              <ConstituencyDirectory
                copy={{
                  assemblySegment: regional.assemblySegment,
                  clearSearch: regional.clearSearch,
                  noResults: regional.noResults,
                  officialNameNote: regional.officialNameNote,
                  resultCount: regional.resultCount,
                  scheduledCasteSeat: regional.scheduledCasteSeat,
                  searchButton: regional.searchButton,
                  searchLabel: regional.searchLabel,
                  searchPlaceholder: regional.searchPlaceholder,
                }}
                entries={constituencies}
                locale={locale}
                showRegionFilter
              />
            </div>
          </div>
        </section>

        <section className="border-y border-[#d8c9a5] bg-[#efe6d2]">
          <div className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
            <SectionHeading
              eyebrow="Regional navigation"
              title="Four useful lenses, never official boundaries."
              body="Regional groupings help readers browse the directory while the underlying Assembly records remain unchanged."
            />
            <RegionCards dictionary={regional} locale={locale} />
          </div>
        </section>

        <section className="bg-[#0d2137] text-white">
          <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-12 lg:py-24">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-[#e6c56c] uppercase">
                Fatehgarh Sahib research project
              </p>
              <h2 className="mt-4 text-balance font-serif text-4xl font-bold sm:text-5xl">
                Nine Assembly segments. One transparent pilot design.
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
                The parliamentary project page links all nine verified Assembly
                segments, explains the district distinction and previews a
                future survey process without collecting responses.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  className="inline-flex min-h-12 items-center rounded-full bg-[#e6c56c] px-6 font-bold text-[#0d2137] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white"
                  href="/en/fatehgarh-sahib"
                >
                  Open project overview
                </a>
                <a
                  className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-6 font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#e6c56c]"
                  href="/en/fatehgarh-sahib/survey"
                >
                  Preview questionnaire
                </a>
              </div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-7">
              <p className="text-sm font-bold text-[#e6c56c]">
                Planned, not approved
              </p>
              <p className="mt-3 font-serif text-3xl font-bold">
                10 November 2026
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                This date does not activate collection. Legal, privacy,
                security, operations and final launch approvals remain false.
              </p>
            </div>
          </div>
        </section>

        <section className="scroll-mt-8 bg-[#081625] text-white" id="research">
          <div className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <SectionHeading
              light
              eyebrow="Research & methodology"
              title="Credibility begins with visible limits."
              body="Panjab 117 is designed to make sources, assumptions, participant protections and uncertainty legible before any findings are published."
            />
            <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-slate-700 bg-slate-700 md:grid-cols-2 xl:grid-cols-5">
              {methods.map(([number, title, body]) => (
                <li className="bg-[#081625] p-7" key={number}>
                  <span className="font-serif text-3xl font-bold text-[#e6c56c]">
                    {number}
                  </span>
                  <h3 className="mt-8 text-lg font-bold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="scroll-mt-8 bg-[#f8f4e9]" id="about">
          <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 lg:py-24">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-[#755a25] uppercase">
                About Panjab 117
              </p>
              <h2 className="mt-4 font-serif text-4xl font-bold text-[#0d2137]">
                Independent by design.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-slate-700">
              <p>
                Panjab 117 is an independent civic-research project covering
                every Punjab Legislative Assembly constituency. It does not
                endorse political parties, candidates or governments.
              </p>
              <p>
                The platform currently publishes a read-only research preview.
                Contact, privacy-request and sponsorship services are not yet
                operational, so no details are invented or implied.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter dictionary={t} />
    </>
  );
}

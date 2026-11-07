import { getConstituenciesByRegion, regions } from "@/data/constituencies";
import type { Locale } from "@/lib/i18n";
import type { RegionalDictionary } from "@/lib/regional-translations";

type RegionCardsProps = {
  locale: Locale;
  dictionary: RegionalDictionary;
};

const regionNumbers = {
  majha: "01",
  malwa: "02",
  doaba: "03",
  puadh: "04",
} as const;

export function RegionCards({ locale, dictionary: t }: RegionCardsProps) {
  return (
    <div className="mt-12 grid gap-4 md:grid-cols-2">
      {regions.map((region) => {
        const count = getConstituenciesByRegion(region).length;
        const copy = t.regions[region];

        return (
          <article
            className="group relative overflow-hidden rounded-[1.75rem] border border-[#d8c9a5] bg-[#fffdf7] p-7 shadow-[0_18px_50px_rgba(13,33,55,0.08)] sm:p-9"
            key={region}
          >
            <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-[#b08d46]/10" />
            <p className="font-serif text-sm font-bold tracking-[0.18em] text-[#8b6c2f]">
              {regionNumbers[region]}
            </p>
            <h3 className="mt-5 font-serif text-4xl font-bold tracking-tight text-[#0d2137]">
              {copy.name}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {copy.description}
            </p>
            <p className="mt-7 text-xs font-bold tracking-[0.1em] text-[#755a25] uppercase">
              {count} {t.provisionalCount}
            </p>
            <a
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0d2137] px-5 py-2.5 text-sm font-bold text-white outline-none transition hover:bg-[#173a5e] focus-visible:ring-3 focus-visible:ring-[#b08d46] focus-visible:ring-offset-3"
              href={`/${locale}/regions/${region}`}
            >
              {t.exploreRegion}
              <span aria-hidden="true">→</span>
            </a>
          </article>
        );
      })}
    </div>
  );
}

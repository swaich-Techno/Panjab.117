import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/translations";
import { BRAND_NUMBER, BRAND_WORD } from "@/lib/branding";

type SiteHeaderProps = {
  dictionary: Dictionary;
  locale: Locale;
};

const navigation = [
  ["/en/#constituencies", "Constituencies"],
  ["/en/fatehgarh-sahib", "Fatehgarh Sahib"],
  ["/en/fatehgarh-sahib/survey", "Survey preview"],
  ["/en/#research", "Research & methodology"],
  ["/en/#about", "About"],
] as const;

export function SiteHeader({ dictionary: t }: SiteHeaderProps) {
  return (
    <header className="border-b border-[#d8c9a5] bg-[#f8f4e9]/95">
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-5 px-5 py-4 sm:px-8 lg:px-12">
        <a
          aria-label={`${t.siteName} home`}
          className="group rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-[#b08d46] focus-visible:ring-offset-4"
          href="/en/"
        >
          <span className="block font-serif text-xl font-bold tracking-[-0.03em] text-[#0d2137] sm:text-2xl">
            {BRAND_WORD} <span className="text-[#8b6c2f]">{BRAND_NUMBER}</span>
          </span>
          <span className="hidden text-[0.62rem] font-bold tracking-[0.18em] text-slate-600 uppercase sm:block">
            Independent civic research
          </span>
        </a>

        <nav aria-label="Primary navigation" className="hidden xl:block">
          <ul className="flex items-center gap-6 text-sm font-semibold text-[#0d2137]">
            {navigation.map(([href, label]) => (
              <li key={href}>
                <a
                  className="rounded-sm underline-offset-4 transition hover:text-[#8b6c2f] hover:underline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#b08d46] motion-reduce:transition-none"
                  href={href}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-[#d8c9a5] bg-white px-3 py-2 text-xs font-bold text-[#7d2d1f] sm:inline-flex">
            Collection closed
          </span>
          <details className="relative xl:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-[#b08d46] bg-white px-4 text-sm font-bold text-[#0d2137] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#b08d46]">
              Menu
            </summary>
            <nav
              aria-label="Mobile navigation"
              className="absolute top-14 right-0 z-50 w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border border-[#d8c9a5] bg-white p-3 shadow-2xl"
            >
              <ul className="grid gap-1">
                {navigation.map(([href, label]) => (
                  <li key={href}>
                    <a
                      className="block min-h-11 rounded-xl px-4 py-3 text-sm font-bold text-[#0d2137] hover:bg-[#f8f4e9] focus-visible:outline-3 focus-visible:outline-[#b08d46]"
                      href={href}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

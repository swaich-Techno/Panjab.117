import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/translations";

import { LanguageSelector } from "./language-selector";

type SiteHeaderProps = {
  dictionary: Dictionary;
  locale: Locale;
};

export function SiteHeader({ dictionary: t, locale }: SiteHeaderProps) {
  const navItems = [
    ["#constituencies", t.navExplore],
    ["#survey", t.navSurvey],
    ["#research", t.navResearch],
    ["#support", t.navSponsor],
  ] as const;

  return (
    <header className="border-b border-stone-200 bg-[#fbfaf6]/95">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
        <Link
          className="rounded-sm font-serif text-xl font-bold tracking-tight text-stone-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-4"
          href={`/${locale}`}
        >
          {t.siteName}
          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-amber-500" />
        </Link>
        <div className="flex items-center gap-4">
          <nav aria-label={t.navigationLabel} className="hidden lg:block">
            <ul className="flex items-center gap-6 text-sm font-semibold text-stone-700">
              {navItems.map(([href, label]) => (
                <li key={href}>
                  <Link
                    className="rounded-sm underline-offset-4 transition hover:text-emerald-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
                    href={`/${locale}${href}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <LanguageSelector currentLocale={locale} label={t.languageLabel} />
        </div>
      </div>
      <nav
        aria-label={t.navigationLabel}
        className="overflow-x-auto border-t border-stone-200 lg:hidden"
      >
        <ul className="mx-auto flex w-max min-w-full items-center gap-6 px-5 py-3 text-sm font-semibold text-stone-700 sm:px-8">
          {navItems.map(([href, label]) => (
            <li key={href}>
              <Link
                className="block min-h-8 whitespace-nowrap rounded-sm py-1 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                href={`/${locale}${href}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

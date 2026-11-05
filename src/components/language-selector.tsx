"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ChangeEvent } from "react";

import { locales, localizePath, type Locale } from "@/lib/i18n";

const languageNames: Record<Locale, string> = {
  en: "English",
  pa: "ਪੰਜਾਬੀ",
  hi: "हिन्दी",
};

type LanguageSelectorProps = {
  currentLocale: Locale;
  label: string;
};

export function LanguageSelector({
  currentLocale,
  label,
}: LanguageSelectorProps) {
  const pathname = usePathname();
  const router = useRouter();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const locale = event.target.value as Locale;
    const hash = window.location.hash;
    router.push(`${localizePath(pathname, locale)}${hash}`);
  }

  return (
    <div className="relative flex min-w-0 items-center gap-2">
      <label className="sr-only" htmlFor="language-selector">
        {label}
      </label>
      <span
        aria-hidden="true"
        className="text-[0.65rem] font-bold tracking-[0.18em] text-stone-500 uppercase"
      >
        {currentLocale.toUpperCase()}
      </span>
      <select
        className="min-h-11 max-w-[9.25rem] cursor-pointer appearance-none rounded-full border border-stone-300 bg-white py-2 pr-9 pl-4 text-sm font-semibold text-stone-800 shadow-sm outline-none transition focus:border-emerald-700 focus:outline-2 focus:outline-solid focus:outline-offset-2 focus:outline-emerald-700 sm:max-w-none"
        id="language-selector"
        onChange={handleChange}
        value={currentLocale}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {languageNames[locale]}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 text-xs text-stone-600"
      >
        ↓
      </span>
    </div>
  );
}

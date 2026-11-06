/** Publicly generated locales. Historical pa/hi copy remains in Git history. */
export const locales = ["en"] as const;
export const archivedContentLocales = ["en", "pa", "hi"] as const;

/** Content locales retained for typed archival translation data. */
export type Locale = (typeof archivedContentLocales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return value === defaultLocale;
}

export function localizePath(pathname: string, locale: Locale): string {
  const hashIndex = pathname.indexOf("#");
  const path = hashIndex >= 0 ? pathname.slice(0, hashIndex) : pathname;
  const hash = hashIndex >= 0 ? pathname.slice(hashIndex) : "";
  const segments = path.split("/");

  if (segments[1] && archivedContentLocales.includes(segments[1] as Locale)) {
    segments[1] = locale;
    return `${segments.join("/") || `/${locale}`}${hash}`;
  }

  return `/${locale}${path === "/" ? "" : path}${hash}`;
}

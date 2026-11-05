export const locales = ["pa", "hi", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pa";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localizePath(pathname: string, locale: Locale): string {
  const hashIndex = pathname.indexOf("#");
  const path = hashIndex >= 0 ? pathname.slice(0, hashIndex) : pathname;
  const hash = hashIndex >= 0 ? pathname.slice(hashIndex) : "";
  const segments = path.split("/");

  if (segments[1] && isLocale(segments[1])) {
    segments[1] = locale;
    return `${segments.join("/") || `/${locale}`}${hash}`;
  }

  return `/${locale}${path === "/" ? "" : path}${hash}`;
}

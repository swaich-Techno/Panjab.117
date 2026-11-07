import { locales } from "./i18n";
import { constituencies, regions } from "../data/constituencies";

export const publicPreviewRoutes = locales.flatMap((locale) => [
  `/${locale}`,
  ...regions.map((region) => `/${locale}/regions/${region}`),
  ...constituencies.map(({ slug }) => `/${locale}/constituencies/${slug}`),
  `/${locale}/fatehgarh-sahib`,
  `/${locale}/fatehgarh-sahib/survey`,
  `/${locale}/survey`,
]);

export function getPublicSiteOrigin(
  value = process.env.NEXT_PUBLIC_SITE_URL,
): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    const isLocalDevelopment =
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    if (url.protocol !== "https:" && !isLocalDevelopment) return null;
    if (url.username || url.password || url.pathname !== "/") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function isPublicPreviewIndexingEnabled(
  value = process.env.PUBLIC_PREVIEW_INDEXING_ENABLED,
): boolean {
  return value === "true" && getPublicSiteOrigin() !== null;
}

export function localizedAlternates(path: string): Record<"en", string> {
  return { en: `/en${path}` };
}

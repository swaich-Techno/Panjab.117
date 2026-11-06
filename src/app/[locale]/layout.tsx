import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { isLocale, locales } from "@/lib/i18n";
import {
  getPublicSiteOrigin,
  isPublicPreviewIndexingEnabled,
} from "@/lib/public-site";
import { getDictionary } from "@/lib/translations";

import "../globals.css";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const t = getDictionary(locale);
  const origin = getPublicSiteOrigin();
  const indexingEnabled = isPublicPreviewIndexingEnabled();

  return {
    metadataBase: origin ? new URL(origin) : undefined,
    title: `${t.siteName} | ${t.heroEyebrow}`,
    description: t.heroBody,
    applicationName: t.siteName,
    alternates: { canonical: "/en/" },
    robots: {
      index: indexingEnabled,
      follow: indexingEnabled,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale);

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          {t.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}

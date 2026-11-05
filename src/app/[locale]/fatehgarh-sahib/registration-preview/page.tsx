import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PartyRegistrationPreview } from "@/components/party-registration-preview";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { fatehgarhSahibSegments } from "@/data/fatehgarh-sahib";
import { isLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/public-site";
import { getRegistrationPreviewCopy } from "@/lib/registration/translations";
import { getDictionary } from "@/lib/translations";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getRegistrationPreviewCopy(locale);
  return {
    title: `${copy.title} | Panjab 117`,
    description: copy.syntheticOnly,
    alternates: {
      languages: localizedAlternates("/fatehgarh-sahib/registration-preview"),
    },
  };
}

export default async function RegistrationPreviewPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = getRegistrationPreviewCopy(locale);
  const base = getDictionary(locale);

  return (
    <>
      <SiteHeader dictionary={base} locale={locale} />
      <main className="min-h-screen bg-[#f8f4e9]" id="main-content">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
          <Link
            className="text-sm font-bold text-[#173a5e] underline decoration-[#b08d46] decoration-2 underline-offset-4"
            href={`/${locale}/fatehgarh-sahib`}
          >
            ← {copy.backLink}
          </Link>
          <p className="mt-10 text-xs font-bold tracking-[0.16em] text-[#8b6c2f] uppercase">
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl break-words font-serif text-4xl leading-tight font-bold tracking-tight text-[#0d2137] sm:text-6xl">
            {copy.title}
          </h1>
          <PartyRegistrationPreview
            copy={copy}
            locale={locale}
            segments={fatehgarhSahibSegments}
          />
        </div>
      </main>
      <SiteFooter dictionary={base} />
    </>
  );
}

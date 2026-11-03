import type { Dictionary } from "@/lib/translations";

type SiteFooterProps = {
  dictionary: Dictionary;
};

export function SiteFooter({ dictionary: t }: SiteFooterProps) {
  return (
    <footer className="border-t border-stone-800 bg-stone-950 text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] lg:px-12">
        <div>
          <p className="font-serif text-2xl font-bold text-white">
            {t.siteName}
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-stone-400">
            {t.footerStatement}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
          <p className="font-semibold text-white">{t.privacy}</p>
          <p className="font-semibold text-white">{t.contact}</p>
          <p className="text-stone-500">{t.placeholder}</p>
          <p className="text-stone-500">{t.placeholder}</p>
        </div>
        <p className="border-t border-stone-800 pt-6 text-xs tracking-wide text-stone-500 md:col-span-2">
          © {new Date().getFullYear()} {t.siteName} · {t.rights}
        </p>
      </div>
    </footer>
  );
}

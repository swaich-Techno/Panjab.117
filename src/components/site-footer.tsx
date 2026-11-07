import type { Dictionary } from "@/lib/translations";

type SiteFooterProps = {
  dictionary: Dictionary;
};

export function SiteFooter({ dictionary: t }: SiteFooterProps) {
  return (
    <footer className="border-t border-[#284963] bg-[#081625] text-slate-200">
      <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-12">
        <div>
          <p className="font-serif text-3xl font-bold text-white">
            PANJAB <span className="text-[#e6c56c]">117</span>
          </p>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
            {t.footerStatement} This platform is not affiliated with a political
            party, candidate or government body.
          </p>
          <p className="mt-5 text-sm font-bold text-[#e6c56c]">@panjab.117</p>
        </div>
        <nav aria-label="Footer navigation">
          <h2 className="text-xs font-bold tracking-[0.16em] text-[#e6c56c] uppercase">
            Explore
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                className="hover:text-white hover:underline"
                href="/en/#constituencies"
              >
                All constituencies
              </a>
            </li>
            <li>
              <a
                className="hover:text-white hover:underline"
                href="/en/fatehgarh-sahib"
              >
                Fatehgarh Sahib project
              </a>
            </li>
            <li>
              <a
                className="hover:text-white hover:underline"
                href="/en/fatehgarh-sahib/survey"
              >
                Survey preview
              </a>
            </li>
            <li>
              <a
                className="hover:text-white hover:underline"
                href="/en/#research"
              >
                Methodology
              </a>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className="text-xs font-bold tracking-[0.16em] text-[#e6c56c] uppercase">
            Privacy & contact
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            No public privacy or contact service is operational in this preview.
            No survey responses are accepted or stored.
          </p>
        </div>
        <div className="border-t border-slate-700 pt-6 text-xs leading-6 text-slate-300 lg:col-span-3 lg:flex lg:items-center lg:justify-between">
          <p>
            © {new Date().getFullYear()} Panjab 117. Independent civic research.
          </p>
          <p className="mt-2 lg:mt-0">
            English-only static preview · Indexing disabled
          </p>
        </div>
      </div>
    </footer>
  );
}

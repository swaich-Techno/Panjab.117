type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  body: string;
  light?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  body,
  light = false,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <p
        className={`text-xs font-bold tracking-[0.2em] uppercase ${light ? "text-amber-300" : "text-emerald-800"}`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 text-balance font-serif text-3xl leading-tight font-bold tracking-tight sm:text-4xl lg:text-5xl ${light ? "text-white" : "text-stone-950"}`}
      >
        {title}
      </h2>
      <p
        className={`mt-5 max-w-2xl text-base leading-7 sm:text-lg ${light ? "text-stone-300" : "text-stone-600"}`}
      >
        {body}
      </p>
    </div>
  );
}

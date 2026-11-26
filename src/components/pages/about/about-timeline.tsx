import { TIMELINE } from "@/data/about-data";

export function AboutTimeline() {
  return (
    <section className="py-6" aria-label="Our journey">
      <ol className="relative grid gap-6 rounded-2xl border border-border bg-card/70 p-5 backdrop-blur sm:grid-cols-4 sm:gap-4">
        {/* connecting line (desktop) */}
        <span
          aria-hidden="true"
          className="absolute top-[30px] right-[12.5%] left-[12.5%] hidden border-t-2 border-dotted border-primary/30 sm:block"
        />
        {TIMELINE.map(({ year, label }) => (
          <li key={year} className="relative flex items-center gap-4 sm:flex-col sm:gap-2 sm:text-center">
            <span className="relative z-10 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 ring-4 ring-card">
              <span className="size-2.5 rounded-full bg-primary" />
            </span>
            <div>
              <p className="text-sm font-extrabold">{year}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
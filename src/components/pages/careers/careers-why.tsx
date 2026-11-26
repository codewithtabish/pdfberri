import { PERKS } from "@/data/careers-data";
import { SectionHeading } from "./careers-section-heading";

export function CareersWhy() {
  return (
    <section aria-labelledby="why-heading">
      <SectionHeading title="Why work with us" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="group flex flex-col items-center rounded-2xl border border-border bg-card/70 p-6 text-center backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
          >
            <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <Icon className="size-7" />
            </span>
            <h3 className="mt-4 text-base font-bold">{title}</h3>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
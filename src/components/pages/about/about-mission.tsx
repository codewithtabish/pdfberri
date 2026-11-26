import { STATS } from "@/data/about-data";
import { Target, Telescope } from "lucide-react";

const CARDS = [
  {
    icon: Target,
    title: "Our Mission",
    text: "To make PDF and AI tools simple, fast and accessible for everyone, everywhere.",
  },
  {
    icon: Telescope,
    title: "Our Vision",
    text: "A more productive, informed and creative world powered by smart document tools.",
  },
];

export function AboutMission() {
  return (
    <section className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        {CARDS.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="flex items-center gap-5 rounded-2xl border border-border bg-card/70 p-5 backdrop-blur sm:p-6"
          >
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-8" />
            </span>
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">{text}</p>
            </div>
          </article>
        ))}
      </div>

      <dl className="grid grid-cols-2 divide-border rounded-2xl border border-border bg-card/70 backdrop-blur md:grid-cols-4 md:divide-x">
        {STATS.map(({ value, label }, i) => (
          <div
            key={label}
            className={`px-4 py-5 text-center ${i < 2 ? "border-b border-border md:border-b-0" : ""}`}
          >
            <dt className="order-2 text-sm text-muted-foreground">{label}</dt>
            <dd className="text-2xl font-extrabold tracking-tight sm:text-3xl">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
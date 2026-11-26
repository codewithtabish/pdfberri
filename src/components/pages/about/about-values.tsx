import { VALUES } from "@/data/about-data";

export function AboutValues() {
  return (
    <section className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-3">
      {VALUES.map(({ icon: Icon, title, text }) => (
        <article
          key={title}
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card/70 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
        >
          <Icon className="size-7 shrink-0 text-primary transition-transform group-hover:scale-110" />
          <div>
            <h3 className="text-sm font-bold">{title}</h3>
            <p className="text-sm text-muted-foreground">{text}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
import { SPLIT_STEPS } from "./split-constants";

export function SplitHowItWorks() {
  return (
    <section aria-labelledby="split-how-heading" className="space-y-6">
      <h2 id="split-how-heading" className="text-center text-2xl font-bold text-foreground">
        How to split PDF files
      </h2>
      <ol className="grid gap-4 md:grid-cols-3">
        {SPLIT_STEPS.map(({ title, description, Icon }, index) => (
          <li key={title} className="flex items-center gap-3">
            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {index + 1}
            </span>
            <Icon className="size-6 shrink-0 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

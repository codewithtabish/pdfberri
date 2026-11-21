import { SPLIT_FEATURES } from "./split-constants";

export function SplitFeatures() {
  return (
    <section aria-labelledby="split-features-heading" className="space-y-6">
      <h2 id="split-features-heading" className="text-center text-2xl font-bold text-foreground">
        A simpler way to split PDFs
      </h2>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SPLIT_FEATURES.map(({ title, description, Icon }) => (
          <li key={title} className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

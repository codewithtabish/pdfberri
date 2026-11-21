import { BoltIcon, LayersIcon, ProtectIcon, TargetIcon } from "@/components/general/icons/pdf-icons";

const FEATURES = [
  { title: "Lossless by default", description: "Structural optimization keeps your content intact.", Icon: TargetIcon },
  { title: "Flexible modes", description: "Presets for balance, size, and quality.", Icon: LayersIcon },
  { title: "Local processing", description: "Your file never leaves your device.", Icon: ProtectIcon },
  { title: "Honest results", description: "We tell you when a file can't be reduced.", Icon: BoltIcon },
] as const;

export function CompressFeatures() {
  return (
    <section aria-labelledby="compress-features-heading" className="space-y-6">
      <h2 id="compress-features-heading" className="text-center text-2xl font-bold text-foreground">A simpler way to compress PDFs</h2>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ title, description, Icon }) => (
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
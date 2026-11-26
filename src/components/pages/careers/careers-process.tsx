import { PROCESS } from "@/data/careers-data";
import { SectionHeading } from "./careers-section-heading";

export function CareersProcess() {
  return (
    <section aria-label="Our hiring process">
      <SectionHeading title="Our hiring process" />

      <ol className="relative mt-8 grid gap-6 sm:grid-cols-4">
        {/* dotted connector (desktop) */}
        <span
          aria-hidden="true"
          className="absolute top-4.5 right-[12.5%] left-[12.5%] hidden border-t-2 border-dotted border-primary/40 sm:block"
        />
        {PROCESS.map(({ step, label }) => (
          <li
            key={step}
            className="relative flex items-center gap-4 sm:flex-col sm:gap-3 sm:text-center"
          >
            <span className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground ring-4 ring-background">
              {step}
            </span>
            <span className="text-sm font-semibold">{label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
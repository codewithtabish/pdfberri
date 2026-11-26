import Image from "next/image";
import { CheckIcon } from "@/components/general/icons/pdf-icons";
import { SectionHeading } from "./careers-section-heading";
import { WORK_POINTS } from "@/data/careers-data";

export function CareersHowWeWork() {
  return (
    <section
      id="how-we-work"
      className="grid scroll-mt-24 items-center gap-8 lg:grid-cols-2 lg:gap-12"
    >
      <div>
        <SectionHeading
          align="left"
          title="How we work"
          description="A small, focused team that cares about doing a few things really well."
        />
        <ul className="mt-6 space-y-3">
          {WORK_POINTS.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm sm:text-base">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <CheckIcon className="size-3.5" />
              </span>
              <span className="text-pretty">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-3xl border border-border shadow-lg shadow-primary/10">
        <Image
          src="/images/careers/careers-how-we-work.webp"
          alt="PDFBerri berry mascot with a browser window and a PDF document"
          fill
          sizes="(min-width: 1024px) 600px, 100vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
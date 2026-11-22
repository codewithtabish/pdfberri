import Image from "next/image";
import { CheckCircleIcon } from "@/components/general/icons/pdf-icons";
import { PRIVACY_POINTS } from "./protect-config";
import { Reveal } from "./protect-motion";

export function ProtectPrivacyNote() {
  return (
    <Reveal className="h-full">
      <section
        aria-labelledby="protect-privacy-heading"
        className="flex h-full flex-col items-center gap-5 rounded-3xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:p-6"
      >
        <div className="relative aspect-3/2 w-40 shrink-0 sm:w-48">
          <Image
            src="/images/protect-pdf/Security_Emblem.webp"
            alt="Blue shield with a padlock surrounded by orbiting rings"
            fill
            sizes="192px"
            className="object-contain"
          />
        </div>

        <div className="flex flex-col gap-3">
          <h2
            id="protect-privacy-heading"
            className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
          >
            Your documents stay yours.
          </h2>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            {PRIVACY_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Reveal>
  );
}
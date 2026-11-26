import Link from "next/link";
import { MailIcon } from "@/components/general/icons/pdf-icons";
import { applyHref, CAREERS_EMAIL } from "@/data/careers-data";

export function CareersNoRole() {
  return (
    <section className="flex flex-col items-center gap-5 rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-accent to-primary/5 p-6 text-center sm:p-8 lg:flex-row lg:text-left">
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
        <MailIcon className="size-7" />
      </span>

      <div className="flex-1">
        <h2 className="text-xl font-extrabold tracking-tight">Don&apos;t see your role?</h2>
        <p className="mt-1 text-sm text-pretty text-muted-foreground">
          Send us your resume at{" "}
          <a
            href={applyHref()}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {CAREERS_EMAIL}
          </a>{" "}
          and tell us how you would like to help.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={applyHref()}
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Send your resume
        </a>
        <Link
          href="/contact"
          className="inline-flex h-11 items-center justify-center rounded-full border border-primary/40 px-6 text-sm font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Contact us
        </Link>
      </div>
    </section>
  );
}
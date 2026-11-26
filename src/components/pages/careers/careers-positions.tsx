"use client";

import { useState } from "react";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  MailIcon,
  MapPinIcon,
} from "@/components/general/icons/pdf-icons";

import { SectionHeading } from "./careers-section-heading";
import { applyHref, CAREERS_EMAIL, DEPARTMENTS, ROLES } from "@/data/careers-data";

export function CareersPositions() {
  const [active, setActive] = useState<(typeof DEPARTMENTS)[number]>("All");

  const visible =
    active === "All" ? ROLES : ROLES.filter((r) => r.department === active);

  return (
    <section id="open-positions" className="scroll-mt-24">
      <SectionHeading title="Open positions" />

      {ROLES.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-card/70 p-8 text-center">
          <p className="font-semibold">No open roles right now.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            You are still welcome to send your resume to{" "}
            <a
              href={applyHref()}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {CAREERS_EMAIL}
            </a>
            .
          </p>
        </div>
      ) : (
        <>
          <div
            role="group"
            aria-label="Filter roles by department"
            className="mt-6 flex flex-wrap justify-center gap-2"
          >
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                type="button"
                aria-pressed={active === dept}
                onClick={() => setActive(dept)}
                className={`h-10 rounded-full px-5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  active === dept
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "border border-border bg-card/70 text-foreground hover:border-primary/40 hover:bg-accent"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <ul className="mt-6 flex flex-col gap-3">
            {visible.map(({ id, title, department, location, type, icon: Icon }) => (
              <li
                key={id}
                className="group flex flex-col gap-4 rounded-2xl border border-border bg-card/70 p-4 backdrop-blur transition hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 sm:flex-row sm:items-center sm:gap-5"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </span>

                <h3 className="text-base font-bold sm:w-56 sm:shrink-0">{title}</h3>

                <div className="flex flex-1 flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className="rounded-full bg-muted px-3 py-1 text-foreground/80">
                    {department}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-foreground/80">
                    <MapPinIcon className="size-3.5" />
                    {location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-foreground/80">
                    <BriefcaseIcon className="size-3.5" />
                    {type}
                  </span>
                </div>

                <a
                  href={applyHref(title)}
                  aria-label={`Apply by email for ${title}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-primary/40 px-5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <MailIcon className="size-4" />
                  Apply by email
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </li>
            ))}
          </ul>

          {visible.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              No open roles in this department right now.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
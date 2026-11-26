import Image from "next/image";
import * as React from "react";

import {
  BoltIcon,
  DevicesIcon,
  DiamondIcon,
  DownloadIcon,
  GiftIcon,
  OrganizeIcon,
  ShieldCheckIcon,
  SlidersIcon,
  StarIcon,
  UploadIcon,
} from "@/components/general/icons/pdf-icons";
import { cn } from "@/lib/utils";

type IconType = React.ComponentType<{ className?: string }>;

/* ------------------------------------------------------------------ */
/* shared                                                              */
/* ------------------------------------------------------------------ */

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-xl font-extrabold italic tracking-tight text-foreground sm:text-2xl"
    >
      <span className="relative inline-block pb-2">
        {children}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-1.5 w-full rounded-full bg-linear-to-r from-primary via-violet-500 to-transparent"
        />
      </span>
    </h2>
  );
}

const ROW =
  "grid gap-5 lg:grid-cols-[11rem_minmax(0,1fr)] lg:items-center lg:gap-8";

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

const STEPS: { title: string; desc: string; icon: IconType }[] = [
  { title: "Upload", desc: "Drag & drop your files", icon: UploadIcon },
  { title: "Choose tool & settings", desc: "Customize your options", icon: SlidersIcon },
  { title: "Download or share", desc: "Get your result instantly", icon: DownloadIcon },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading" className={cn(ROW, "mt-10 sm:mt-12")}>
      <SectionTitle id="how-it-works-heading">How It Works</SectionTitle>

      <ol className="flex flex-col gap-5 md:flex-row md:items-center">
        {STEPS.map(({ title, desc, icon: Icon }, i) => (
          <React.Fragment key={title}>
            <li className="relative flex items-center gap-3">
              <span
                aria-hidden="true"
                className="select-none text-6xl font-extrabold leading-none text-primary/15"
              >
                {i + 1}
              </span>
              <span className="block">
                <Icon className="size-6 text-primary" />
                <span className="mt-1 block text-sm font-bold text-foreground">{title}</span>
                <span className="block text-xs text-muted-foreground">{desc}</span>
              </span>
            </li>
            {i < STEPS.length - 1 && (
              <li
                aria-hidden="true"
                className="hidden min-w-6 flex-1 border-t-2 border-dashed border-primary/30 md:block"
              />
            )}
          </React.Fragment>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Why PDFBerri + stats                                                */
/* ------------------------------------------------------------------ */

const BENEFITS: { title: string; desc: string; icon: IconType }[] = [
  { title: "Lightning fast", desc: "Process files in seconds", icon: BoltIcon },
  { title: "Bank-level privacy", desc: "Your data stays yours", icon: ShieldCheckIcon },
  { title: "Works on any device", desc: "Desktop, tablet, mobile", icon: DevicesIcon },
  { title: "High-quality output", desc: "Get the best results", icon: DiamondIcon },
  { title: "All tools in one place", desc: "Do more with less", icon: OrganizeIcon },
  { title: "Free to start", desc: "No hidden costs", icon: GiftIcon },
];

const STATS = [
  { value: "50M+", label: "files processed" },
  { value: "30+", label: "tools" },
  { value: "180+", label: "countries" },
  { value: "4.9", label: "rating", star: true },
];

export function WhyPdfBerri() {
  return (
    <section aria-labelledby="why-heading" className="mt-10 sm:mt-12">
      <div className={ROW}>
        <SectionTitle id="why-heading">Why PDFBerri?</SectionTitle>

        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {BENEFITS.map(({ title, desc, icon: Icon }) => (
            <li
              key={title}
              className="group flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-foreground">{title}</span>
                <span className="block text-xs text-muted-foreground">{desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* stats */}
      <ul className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 shadow-sm lg:grid-cols-4">
        {STATS.map(({ value, label, star }) => (
          <li key={label} className="bg-card px-4 py-5 text-center">
            <span className="flex items-center justify-center gap-1 text-3xl font-extrabold tracking-tight text-foreground">
              {value}
              {star && <StarIcon className="size-6 text-amber-400" />}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

const TESTIMONIALS = [
  {
    quote: "PDFBerri is incredibly easy to use. It saves me hours every week!",
    name: "Sarah Chen",
    role: "Content Creator",
    avatar: "/images/home/feedback-profile-one.webp",
  },
  {
    quote: "The AI tools are amazing. Super helpful and so fast!",
    name: "David Kim",
    role: "Freelancer",
    avatar: "/images/home/feedback-profile-two.webp",
    featured: true,
  },
  {
    quote: "A complete PDF toolkit. Highly recommended!",
    name: "Amina Rahman",
    role: "Designer",
    avatar: "/images/home/feedback-profile-three.webp",
  },
];

export function Testimonials() {
  return (
    <section aria-labelledby="testimonials-heading" className={cn(ROW, "mt-10 sm:mt-12")}>
      <SectionTitle id="testimonials-heading">What Our Users Say</SectionTitle>

      <ul className="grid gap-3 md:grid-cols-3">
        {TESTIMONIALS.map(({ quote, name, role, avatar, featured }) => (
          <li key={name}>
            <figure
              className={cn(
                "flex h-full items-center gap-3.5 rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur transition-all duration-200",
                featured
                  ? "border-primary/60 shadow-lg shadow-primary/10"
                  : "border-border/60 hover:border-primary/40",
              )}
            >
              <Image
                src={avatar}
                alt={`${name}, ${role}`}
                width={64}
                height={64}
                className="size-14 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div className="min-w-0 flex-1">
                <blockquote className="text-sm font-medium leading-snug text-foreground">
                  “{quote}”
                </blockquote>
                <figcaption className="mt-2 flex items-center justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-foreground">{name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{role}</span>
                  </span>
                  <span className="flex shrink-0" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} className="size-3.5 text-amber-400" />
                    ))}
                  </span>
                </figcaption>
              </div>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
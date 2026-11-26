import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { TEAM } from "@/data/about-data";

export function AboutTeam() {
  return (
    <section className="grid gap-4 py-2 sm:grid-cols-2 lg:grid-cols-4">
      {TEAM.map(({ name, role, image }) => (
        <article
          key={name}
          className="flex items-center gap-4 rounded-2xl border border-border bg-card/70 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10"
        >
          <Image
            src={image}
            alt={name}
            width={56}
            height={56}
            className="size-14 rounded-full object-cover"
          />
          <div>
            <h3 className="text-sm font-bold">{name}</h3>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </article>
      ))}

      <Link
        href="/careers"
        className="group flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/10 p-4 transition hover:bg-primary/15"
      >
        <span className="grid size-14 place-items-center rounded-full bg-primary/15 text-primary">
          <Users className="size-7" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-primary">Join us</h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            We&apos;re hiring
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </p>
        </div>
      </Link>
    </section>
  );
}
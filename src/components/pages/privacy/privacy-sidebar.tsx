"use client";

import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "introduction", title: "1. Introduction" },
  { id: "information-we-collect", title: "2. Information We Collect" },
  { id: "how-we-use", title: "3. How We Use Your Info" },
  { id: "document-processing", title: "4. Document Processing" },
  { id: "ai-features", title: "5. AI Features & Data" },
  { id: "data-security", title: "6. Data Security" },
  { id: "your-rights", title: "7. Your Privacy Rights" },
  { id: "contact", title: "8. Contact Us" },
];

export function PrivacySidebar() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Offset for sticky header
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <aside className="sticky top-24 hidden h-fit w-64 shrink-0 lg:block">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Table of Contents
        </h3>
        <nav className="flex flex-col space-y-3">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => handleScroll(e, section.id)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {section.title}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
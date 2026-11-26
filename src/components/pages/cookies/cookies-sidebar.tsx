"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "introduction", title: "1. Introduction" },
  { id: "what-are-cookies", title: "2. What Are Cookies?" },
  { id: "why-we-use", title: "3. Why We Use Cookies" },
  { id: "types-of-cookies", title: "4. Types of Cookies" },
  { id: "third-party", title: "5. Third-Party Cookies" },
  { id: "how-we-use", title: "6. How We Use Info" },
  { id: "managing", title: "7. Managing Preferences" },
  { id: "browser-controls", title: "8. Browser Controls" },
  { id: "retention", title: "9. Cookie Retention" },
  { id: "international", title: "10. International Visitors" },
  { id: "changes", title: "11. Changes to Policy" },
  { id: "contact", title: "12. Contact Us" },
];

export function CookiesSidebar() {
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <aside className="sticky top-24 hidden max-h-[calc(100vh-8rem)] w-64 shrink-0 flex-col overflow-y-auto pb-8 lg:flex">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Table of Contents
      </h3>
      <nav className="flex flex-col space-y-1">
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => handleScroll(e, section.id)}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              activeSection === section.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {section.title}
          </a>
        ))}
      </nav>
    </aside>
  );
}
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "introduction", title: "1. Introduction" },
  { id: "acceptance", title: "2. Acceptance of Terms" },
  { id: "services", title: "3. Description of Services" },
  { id: "accounts", title: "4. User Accounts" },
  { id: "responsibilities", title: "5. User Responsibilities" },
  { id: "acceptable-use", title: "6. Acceptable Use Policy" },
  { id: "content-ownership", title: "7. Content Ownership" },
  { id: "file-handling", title: "8. Document Processing" },
  { id: "ai-features", title: "9. AI-Powered Features" },
  { id: "intellectual-property", title: "10. Intellectual Property" },
  { id: "third-party", title: "11. Third-Party Services" },
  { id: "availability", title: "12. Service Availability" },
  { id: "disclaimer", title: "13. Disclaimer of Warranties" },
  { id: "liability", title: "14. Limitation of Liability" },
  { id: "indemnification", title: "15. Indemnification" },
  { id: "termination", title: "16. Suspension & Termination" },
  { id: "privacy", title: "17. Privacy" },
  { id: "changes", title: "18. Changes to Terms" },
  { id: "governing-law", title: "19. Governing Law" },
  { id: "contact", title: "20. Contact Information" },
];

export function TermsSidebar() {
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
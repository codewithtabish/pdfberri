import { TermsHero } from "./terms-hero";
import { TermsSidebar } from "./terms-sidebar";
import { TermsContent } from "./terms-content";
import { TermsSupport } from "./terms-support";
import { TermsCta } from "./terms-cta";

export function TermsPage() {
  return (
    <div className="flex w-full flex-col">
      <TermsHero />
      
      {/* Main Layout: Sidebar + Text */}
      <section className="mx-auto mt-16 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          <TermsSidebar />
          <TermsContent />
        </div>
      </section>

      <TermsSupport />
      <TermsCta />
    </div>
  );
}
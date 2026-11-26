import { PrivacyHero } from "./privacy-hero";
import { PrivacySidebar } from "./privacy-sidebar";
import { PrivacyContent } from "./privacy-content";
import { PrivacyCta } from "./privacy-cta";

export function PrivacyPage() {
  return (
    <div className="flex w-full flex-col">
      <PrivacyHero />
      
      {/* Main Content Layout: Sidebar + Text */}
      <section className="mx-auto mt-16 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          <PrivacySidebar />
          <PrivacyContent />
        </div>
      </section>

      <PrivacyCta />
    </div>
  );
}
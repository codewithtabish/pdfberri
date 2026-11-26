import { CookiesHero } from "./cookies-hero";
import { CookiesSidebar } from "./cookies-sidebar";
import { CookiesContent } from "./cookies-content";
import { CookiesSupport } from "./cookies-support";
import { CookiesCta } from "./cookies-cta";

export function CookiesPage() {
  return (
    <div className="flex w-full flex-col">
      <CookiesHero />
      
      {/* Main Layout: Sidebar + Text */}
      <section className="mx-auto mt-16 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          <CookiesSidebar />
          <CookiesContent />
        </div>
      </section>

      <CookiesSupport />
      <CookiesCta />
    </div>
  );
}
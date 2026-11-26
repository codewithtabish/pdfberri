import type { Metadata } from "next";
import { HeroSection } from "./hero-section";
import { HomePopularTools } from "./home-popular-tools";
import { AiAssistant } from "./ai-assistant";
import { HowItWorks, WhyPdfBerri, Testimonials } from "./trust-sections";
import { CtaBanner } from "./cta-banner";

export default function HomePage() {
  return (
    <div className="flex min-w-0 flex-col gap-10 sm:gap-12 lg:gap-16 [&>section]:mt-0">
      <HeroSection />
      <HomePopularTools />
      <AiAssistant />
      <HowItWorks />
      <WhyPdfBerri />
      <Testimonials />
      <CtaBanner />
    </div>
  );
}
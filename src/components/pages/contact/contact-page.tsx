import { ContactHero } from "./contact-hero";
import { ContactFormSection } from "./contact-form-section";
import { ContactInfoCards } from "./contact-info-cards";
import { ContactBeforeYouWrite } from "./contact-before-you-write";
import { ContactFaq } from "./contact-faq";
import { ContactCta } from "./contact-cta";

export function ContactPage() {
  return (
    <div className="flex w-full flex-col pb-24">
      <ContactHero />

      {/* Main Form & Info Grid */}
      <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_360px]">
        <ContactFormSection />
        <ContactInfoCards />
      </section>

      {/* <ContactBeforeYouWrite /> */}
      <ContactFaq />
      <ContactCta />
    </div>
  );
}
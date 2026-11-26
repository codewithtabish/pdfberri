import { FaqHero } from "./faq-hero";
import { FaqCategories } from "./faq-categories";
import { FaqPopular } from "./faq-popular";
import { FaqSupport } from "./faq-support";
import { FaqCta } from "./faq-cta";

export function FaqPage() {
  return (
    <div className="flex w-full flex-col">
      <FaqHero />
      <FaqCategories />
      <FaqPopular />
      {/* <FaqSupport /> */}
      <FaqCta />
    </div>
  );
}
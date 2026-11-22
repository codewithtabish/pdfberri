import { JpgToPdfBreadcrumb } from "./jpg-to-pdf-breadcrumb";
import { JpgToPdfFaq } from "./jpg-to-pdf-faq";
import { JpgToPdfHero } from "./jpg-to-pdf-hero";
import { JpgToPdfHowItWorks } from "./jpg-to-pdf-how-it-works";
import { JpgToPdfPrivacyNote } from "./jpg-to-pdf-privacy-note";
import { JpgToPdfRelatedTools } from "./jpg-to-pdf-related-tools";
import { JpgToPdfWorkspace } from "./jpg-to-pdf-workspace";

/** Server component. Only the workspace is a client component. */
export function JpgToPdfPage() {
  return (
    <div className="flex flex-col gap-10 pb-16 sm:gap-14">
      <div className="flex flex-col gap-2">
        <JpgToPdfBreadcrumb />
        <JpgToPdfHero />
      </div>
      <JpgToPdfWorkspace />
      <JpgToPdfHowItWorks />
      <JpgToPdfPrivacyNote />
      <JpgToPdfRelatedTools />
      <JpgToPdfFaq />
    </div>
  );
}

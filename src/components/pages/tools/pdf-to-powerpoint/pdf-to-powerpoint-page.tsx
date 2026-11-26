import { PdfToPowerpointHero } from "./pdf-to-powerpoint-hero";
import { PdfToPowerpointPopularTools } from "./pdf-to-powerpoint-popular-tools";
import { PdfToPowerpointWorkspace } from "./pdf-to-powerpoint-workspace";

// No horizontal padding or backgrounds here: the shared Container owns both.
export function PdfToPowerpointPage() {
  return (
    <div className="flex flex-col gap-10 py-8">
      <PdfToPowerpointHero />
      <PdfToPowerpointWorkspace />
      <PdfToPowerpointPopularTools />
    </div>
  );
}

import { PowerPointToPdfHero } from "./powerpoint-to-pdf-hero";
import { PowerPointToPdfPopularTools } from "./powerpoint-to-pdf-popular-tools";
import { PowerPointToPdfWorkspace } from "./powerpoint-to-pdf-workspace";

export function PowerPointToPdfPage() {
  return (
    <div className="flex flex-col gap-6">
      <PowerPointToPdfHero />
      <PowerPointToPdfWorkspace />
      <PowerPointToPdfPopularTools />
    </div>
  );
}

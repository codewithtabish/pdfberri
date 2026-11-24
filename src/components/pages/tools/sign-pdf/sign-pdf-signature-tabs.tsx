import type { SignatureTab } from "./sign-pdf-types";

export function SignPdfSignatureTabs({ active, onChange }: { active: SignatureTab, onChange: (t: SignatureTab) => void }) {
  return (
    <div className="flex rounded-md bg-muted p-1">
      {(["draw", "type", "upload"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`flex-1 rounded py-1 text-xs font-medium capitalize ${active === tab ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
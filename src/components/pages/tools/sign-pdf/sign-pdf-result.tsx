// src/components/pages/tools/sign-pdf/sign-pdf-result.tsx
import { CheckIcon } from "@/components/general/icons/pdf-icons";

export function SignPdfResult({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <CheckIcon className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold">Successfully Signed!</h2>
      <p className="text-sm text-muted-foreground">Your signed PDF has been downloaded.</p>
      <button 
        onClick={onReset} 
        className="mt-4 rounded bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Sign Another Document
      </button>
    </div>
  );
}
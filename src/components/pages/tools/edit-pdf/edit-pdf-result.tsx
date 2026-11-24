/**
 * PDFBerri – Edit PDF
 * Post-export result screen
 */

"use client";

import { CheckCircle2, Pencil, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditPdfResultProps {
  fileName: string;
  onEditAgain: () => void;
  onNewFile: () => void;
}

export function EditPdfResult({
  fileName,
  onEditAgain,
  onNewFile,
}: EditPdfResultProps) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">
        PDF exported successfully
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your edited file <strong>{fileName.replace(/\.pdf$/i, "")}-edited.pdf</strong>{" "}
        has been downloaded.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="outline" onClick={onEditAgain} className="gap-2">
          <Pencil className="h-4 w-4" />
          Continue editing
        </Button>
        <Button onClick={onNewFile} className="gap-2">
          <Upload className="h-4 w-4" />
          Edit another PDF
        </Button>
      </div>
    </div>
  );
}

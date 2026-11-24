"use client";
import { UploadIcon } from "@/components/general/icons/pdf-icons";
export function SignPdfUpload({ onFile, error }: { onFile: (f: File) => void, error: string | null }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center py-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Sign PDF</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">Add your signature to a PDF document. Draw, type, or upload your signature and download your signed document.</p>
      </header>
      <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); }} className="mt-8 flex w-full max-w-2xl flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card px-6 py-16 text-center transition-colors hover:bg-muted/30">
        <UploadIcon className="h-10 w-10 text-primary" />
        <h2 className="mt-4 text-lg font-semibold">Drop your PDF here</h2>
        <p className="mt-1 text-sm text-muted-foreground">Files stay in your browser. Nothing is uploaded to a server.</p>
        <label className="mt-6 cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          Choose PDF file
          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
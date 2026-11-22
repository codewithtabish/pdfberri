import Link from "next/link";
import { RotateWorkspace } from "./rotate-workspace";
import { CheckCircleIcon, LockIcon, PdfFileIcon, RotateCwIcon } from "@/components/general/icons/pdf-icons";

export function RotatePdfPage() {
  return (
    <main className="flex flex-col gap-14 py-6 sm:gap-16 sm:py-10">
      <header className="space-y-4 text-center">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/tools" className="hover:text-foreground">PDF Tools</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-foreground">Rotate PDF</li>
          </ol>
        </nav>
        <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Free online PDF tool
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Rotate PDF Pages</h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
          Rotate individual PDF pages or your entire document. Preview every change and download your corrected PDF in seconds.
        </p>
      </header>

      <RotateWorkspace />

      <section className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <RotateCwIcon className="size-4 text-primary" /> How to rotate a PDF
          </h3>
          <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>1. Upload your PDF.</li>
            <li>2. Select the pages.</li>
            <li>3. Rotate and preview.</li>
            <li>4. Download your corrected PDF.</li>
          </ol>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <LockIcon className="size-4 text-primary" /> Your privacy matters
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            PDFBerri processes this operation locally in your browser. Your document is not uploaded to our server.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <CheckCircleIcon className="size-4 text-primary" /> Frequently asked questions
          </h3>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li><strong>How do I rotate a single page?</strong> Select it and click a rotation button.</li>
            <li><strong>Can I rotate multiple pages?</strong> Yes, select them all first.</li>
            <li><strong>Can I rotate all pages at once?</strong> Yes, use the toolbar controls.</li>
          </ul>
        </div>
      </section>

      <nav aria-label="Related tools" className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Related tools:</h3>
        <ul className="flex flex-wrap items-center gap-4 text-sm font-medium text-primary">
          <li><Link href="/tools/merge-pdf" className="hover:underline">Merge PDF</Link></li>
          <li><Link href="/tools/split-pdf" className="hover:underline">Split PDF</Link></li>
          <li><Link href="/tools/compress-pdf" className="hover:underline">Compress PDF</Link></li>
          <li><Link href="/tools/rearrange-pdf-pages" className="hover:underline">Rearrange PDF Pages</Link></li>
          <li><Link href="/tools/delete-pdf-pages" className="hover:underline">Delete PDF Pages</Link></li>
        </ul>
      </nav>
    </main>
  );
}
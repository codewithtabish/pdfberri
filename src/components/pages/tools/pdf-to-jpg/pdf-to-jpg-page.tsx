import Link from "next/link";
import Image from "next/image";
import { PdfToJpgWorkspace } from "./pdf-to-jpg-workspace";
import { PdfToJpgRelatedTools } from "./pdf-to-jpg-related-tools";
import { CheckCircleIcon, LockIcon, ImageIcon } from "@/components/general/icons/pdf-icons";

export function PdfToJpgPage() {
  return (
    <main className="flex flex-col gap-14 py-6 sm:gap-16 sm:py-10">
      {/* Hero */}
      <header className="grid items-center gap-8 lg:grid-cols-2">
        <div className="space-y-4 text-center lg:text-left">
          <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            PDF Converter
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            PDF to JPG Converter
          </h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
            Convert PDF pages into high-quality JPG images in seconds. Preserve layout, formatting, and resolution.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground lg:justify-start">
            <li className="flex items-center gap-2"><LockIcon className="size-4 text-primary" /> Private & secure processing</li>
            <li className="flex items-center gap-2"><CheckCircleIcon className="size-4 text-primary" /> No document upload required</li>
            <li className="flex items-center gap-2"><ImageIcon className="size-4 text-primary" /> High-quality image export</li>
          </ul>
        </div>
        <div className="flex justify-center lg:justify-end">
          <Image
            src="/images/pdf-to-jpg/pdf-to-jpg-hero_one.webp"
            alt="PDF to JPG conversion illustration"
            width={500}
            height={300}
            priority
            className="h-auto w-full max-w-md object-contain"
          />
        </div>
      </header>

      {/* Workspace */}
      <PdfToJpgWorkspace />

      {/* Related Tools */}
      <PdfToJpgRelatedTools />

      {/* SEO/FAQ Section */}
      <section className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <ImageIcon className="size-4 text-primary" /> How it works
          </h3>
          <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>1. Upload your PDF.</li>
            <li>2. Select pages and settings.</li>
            <li>3. Convert and download.</li>
          </ol>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <LockIcon className="size-4 text-primary" /> Your privacy matters
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            PDFBerri processes supported PDF-to-JPG conversions directly in the browser, without uploading the original PDF to our servers.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <CheckCircleIcon className="size-4 text-primary" /> FAQ
          </h3>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li><strong>Can I convert only selected pages?</strong> Yes, just select the pages you want.</li>
            <li><strong>Will converting to JPG reduce quality?</strong> JPG is lossy, but our High and Maximum settings preserve excellent quality.</li>
            <li><strong>Can I choose the resolution?</strong> Yes, from 72 DPI up to 300 DPI.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
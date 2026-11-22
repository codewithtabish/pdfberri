// src/components/pages/tools/word-to-pdf/word-to-pdf-hero.tsx

import {
  BoltIcon,
  PdfFileIcon,
  ProtectIcon,
} from "@/components/general/icons/pdf-icons";

export function WordToPdfHero() {
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <p className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
        Document conversion
      </p>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Word to PDF <span className="text-primary">Converter</span>
      </h1>
      <p className="max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
        Convert Word documents into PDF files. DOCX files are converted in your
        browser, so they aren’t uploaded unless you choose server conversion.
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <li className="inline-flex items-center gap-2">
          <PdfFileIcon className="size-4 text-primary" />
          DOCX converted in your browser
        </li>
        <li className="inline-flex items-center gap-2">
          <BoltIcon className="size-4 text-primary" />
          Simple document conversion
        </li>
        <li className="inline-flex items-center gap-2">
          <ProtectIcon className="size-4 text-primary" />
          Transparent processing &amp; privacy
        </li>
      </ul>
    </header>
  );
}

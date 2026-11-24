// src/components/pages/tools/edit-pdf/edit-pdf-page.tsx
// Server Component. The only client code is <EditPdfWorkspace />.

import type { ReactNode } from 'react';
import { EditPdfWorkspace } from './edit-pdf-workspace';
import { EditPdfFaq } from './edit-pdf-faq';
import { EditPdfRelatedTools } from './edit-pdf-related-tools';

export interface EditPdfPageProps {
  /** Optional slot for breadcrumbs injected by the parent route. */
  children?: ReactNode;
}

export function EditPdfPage({ children }: EditPdfPageProps) {
  return (
    <div className="flex flex-col gap-12 py-6 sm:py-8 lg:py-10">
      {/* ───────────────── Hero ───────────────── */}
      <header className="mx-auto max-w-2xl text-center">
        {children}

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          Edit PDF
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Add text, images, shapes, comments, and signatures to your PDF
          directly in your browser. Your file never leaves your device — no
          uploads, no sign-up, no tracking.
        </p>

        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-1">
            <span aria-hidden className="text-primary">✓</span>
            Local processing
          </li>
          <li className="flex items-center gap-1">
            <span aria-hidden className="text-primary">✓</span>
            No uploads
          </li>
          <li className="flex items-center gap-1">
            <span aria-hidden className="text-primary">✓</span>
            Free
          </li>
        </ul>
      </header>

      {/* ───────────────── Editor ───────────────── */}
      <section aria-labelledby="edit-pdf-editor-heading" className="w-full">
        <h2 id="edit-pdf-editor-heading" className="sr-only">
          PDF editor
        </h2>
        <EditPdfWorkspace />
      </section>

      {/* ───────────────── FAQ ───────────────── */}
      <EditPdfFaq />

      {/* ───────────────── Related tools ───────────────── */}
      <EditPdfRelatedTools />
    </div>
  );
}
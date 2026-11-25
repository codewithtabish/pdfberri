import type { Metadata } from 'next';
import { ExtractPagesWorkspace } from '@/components/pages/tools/extract-pages/extract-pages-workspace';
import { ExtractPagesFaq } from '@/components/pages/tools/extract-pages/extract-pages-faq';
import { ExtractPagesPopularTools } from '@/components/pages/tools/extract-pages/extract-pages-popular-tools';

export const metadata: Metadata = {
  title: 'Extract PDF Pages Online | PDFBerri',
  description: 'Select specific pages from your PDF and extract them into a new document. Free, secure, and processed in your browser.',
};

export default function Page() {
  return (
    <div className="flex flex-col gap-10 py-6 sm:py-8 lg:py-10">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Extract PDF Pages</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Select the pages you need and create a new PDF containing only those pages.
        </p>
      </header>
      
      <section>
        <ExtractPagesWorkspace />
      </section>
      
      <ExtractPagesFaq />
      <ExtractPagesPopularTools />
    </div>
  );
}
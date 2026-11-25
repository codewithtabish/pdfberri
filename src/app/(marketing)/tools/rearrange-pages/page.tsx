import type { Metadata } from 'next';
import { RearrangePagesWorkspace } from '@/components/pages/tools/rearrange-pages/rearrange-pages-workspace';
import { RearrangePagesFaq } from '@/components/pages/tools/rearrange-pages/rearrange-pages-faq';
import { RearrangePagesPopularTools } from '@/components/pages/tools/rearrange-pages/rearrange-pages-popular-tools';

export const metadata: Metadata = {
  title: 'Rearrange PDF Pages Online | PDFBerri',
  description: 'Organize your PDF pages in any order. Drag, drop, and download your perfectly arranged document.',
};

export default function Page() {
  return (
    <div className="flex flex-col gap-10 py-6 sm:py-8 lg:py-10">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Rearrange PDF Pages</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Organize your PDF pages in any order. Drag, drop, and download your perfectly arranged document.
        </p>
      </header>
      <section>
        <RearrangePagesWorkspace />
      </section>
      <RearrangePagesFaq />
      <RearrangePagesPopularTools />
    </div>
  );
}
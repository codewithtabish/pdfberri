import type { Metadata } from 'next';
import { DeletePagesWorkspace } from '@/components/pages/tools/delete-pages/delete-pages-workspace';
import { DeletePagesFaq } from '@/components/pages/tools/delete-pages/delete-pages-faq';
import { DeletePagesPopularTools } from '@/components/pages/tools/delete-pages/delete-pages-popular-tools';

export const metadata: Metadata = {
  title: 'Delete PDF Pages Online | PDFBerri',
  description: 'Remove unwanted pages from your PDF and download a clean document containing the pages you need.',
};

export default function Page() {
  return (
    <div className="flex flex-col gap-10 py-6 sm:py-8 lg:py-10">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Delete PDF Pages</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Remove unwanted pages from your PDF and download a clean document containing the pages you need.
        </p>
      </header>
      <section>
        <DeletePagesWorkspace />
      </section>
      <DeletePagesFaq />
      <DeletePagesPopularTools />
    </div>
  );
}
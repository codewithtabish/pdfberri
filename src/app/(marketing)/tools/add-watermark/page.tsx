import type { Metadata } from 'next';
import { AddWatermarkWorkspace } from '@/components/pages/tools/add-watermark/add-watermark-workspace';
import { AddWatermarkFaq } from '@/components/pages/tools/add-watermark/add-watermark-faq';
import { AddWatermarkPopularTools } from '@/components/pages/tools/add-watermark/add-watermark-popular-tools';

export const metadata: Metadata = {
  title: 'Add Watermark to PDF Online | PDFBerri',
  description: 'Add text or image watermarks to PDF files. Customize opacity, size, rotation, position, and page selection with PDFBerri.',
};

export default function AddWatermarkPage() {
  return (
    <div className="flex flex-col gap-10 py-6 sm:py-8 lg:py-10">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Add Watermark to PDF</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Add a custom text or image watermark to your PDF. Adjust its appearance, position, and pages, then download your watermarked document.
        </p>
      </header>
      <section>
        <AddWatermarkWorkspace />
      </section>
      <AddWatermarkFaq />
      <AddWatermarkPopularTools />
    </div>
  );
}
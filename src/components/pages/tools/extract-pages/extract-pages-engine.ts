import { PDFDocument } from 'pdf-lib';

export async function generateExtractedPdf(
  originalBytes: ArrayBuffer,
  selectedIndices: number[],
  mode: 'combined' | 'separate'
): Promise<{ blob: Blob; filename: string }[]> {
  const srcDoc = await PDFDocument.load(originalBytes);
  const results: { blob: Blob; filename: string }[] = [];

  if (mode === 'combined') {
    const outDoc = await PDFDocument.create();
    const copiedPages = await outDoc.copyPages(srcDoc, selectedIndices);
    copiedPages.forEach(page => outDoc.addPage(page));
    const bytes = await outDoc.save();
    results.push({ blob: new Blob([bytes as any], { type: 'application/pdf' }), filename: 'extracted-pages.pdf' });
  } else {
    for (const index of selectedIndices) {
      const outDoc = await PDFDocument.create();
      const [copiedPage] = await outDoc.copyPages(srcDoc, [index]);
      outDoc.addPage(copiedPage);
      const bytes = await outDoc.save();
      results.push({ blob: new Blob([bytes as any], { type: 'application/pdf' }), filename: `page-${index + 1}.pdf` });
    }
  }
  return results;
}
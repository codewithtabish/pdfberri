import { PDFDocument } from 'pdf-lib';

export async function generateRearrangedPdf(
  originalBytes: ArrayBuffer,
  orderedIndices: number[]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(originalBytes);
  const outDoc = await PDFDocument.create();

  // Copy pages in the exact order specified by orderedIndices
  const copiedPages = await outDoc.copyPages(srcDoc, orderedIndices);
  copiedPages.forEach(page => outDoc.addPage(page));

  return await outDoc.save();
}
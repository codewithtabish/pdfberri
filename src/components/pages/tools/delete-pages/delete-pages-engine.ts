import { PDFDocument } from 'pdf-lib';

export async function generateDeletedPdf(
  originalBytes: ArrayBuffer,
  remainingIndices: number[]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(originalBytes);
  const outDoc = await PDFDocument.create();
  
  const copiedPages = await outDoc.copyPages(srcDoc, remainingIndices);
  copiedPages.forEach(page => outDoc.addPage(page));
  
  return await outDoc.save();
}
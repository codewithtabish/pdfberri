import { PDFDocument } from 'pdf-lib';

export async function loadPdfMetadata(buffer: ArrayBuffer) {
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: false });
  return { pageCount: pdfDoc.getPageCount() };
}
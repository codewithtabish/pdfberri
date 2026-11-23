// src/components/pages/tools/pdf-to-excel/pdf-to-excel-pdfjs.ts
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  // Ensure this file exists in your public/ folder
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'; 
}

export async function loadPdfDocument(file: File): Promise<pdfjsLib.PDFDocumentProxy> {
  const arrayBuffer = await file.arrayBuffer();
  return pdfjsLib.getDocument({ data: arrayBuffer }).promise;
}
// src/components/pages/tools/pdf-to-excel/pdf-to-excel-ocr.ts
import { createWorker } from 'tesseract.js';
import { PDFPageProxy } from 'pdfjs-dist';
import { ExtractedCell } from './pdf-to-excel-types';

export async function extractTextViaOcr(page: PDFPageProxy): Promise<ExtractedCell[]> {
  const viewport = page.getViewport({ scale: 2.0 }); // High scale for better OCR
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) throw new Error('Could not create canvas context');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  // FIXED: pdfjs-dist v4+ requires the 'canvas' property in RenderParameters
  await page.render({ 
    canvasContext: context, 
    viewport,
    canvas: canvas 
  } as any).promise; // Cast as any to bypass strict typing if your local @types are slightly outdated

  // Initialize Tesseract for Urdu ('urd')
  const worker = await createWorker('urd');
  const { data } = await worker.recognize(canvas);
  await worker.terminate();

  // Convert OCR text to our ExtractedCell format
  const lines = data.text.split('\n').filter(line => line.trim().length > 0);
  
  return lines.map((line, index) => ({
    text: line,
    x: 50, 
    y: viewport.height - (index * 30), 
    width: viewport.width - 100,
    height: 20,
  }));
}
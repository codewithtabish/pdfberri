import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function renderPdfPageToCanvas(
  bytes: ArrayBuffer,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number
) {
  const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  await page.render({ canvasContext: ctx, canvas, viewport }).promise;
}
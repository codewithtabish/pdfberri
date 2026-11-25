import * as pdfjsLib from 'pdfjs-dist';
import { THUMBNAIL_WIDTH } from './delete-pages-constants';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function renderThumbnail(
  bytes: ArrayBuffer, 
  pageNumber: number, 
  canvas: HTMLCanvasElement,
  signal?: AbortSignal
) {
  const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const scale = THUMBNAIL_WIDTH / viewport.width;
  const scaled = page.getViewport({ scale });

  if (signal?.aborted) return null;

  canvas.width = scaled.width;
  canvas.height = scaled.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const renderParams: any = { 
    canvasContext: ctx, 
    canvas, 
    viewport: scaled,
    abortSignal: signal 
  };

  return page.render(renderParams);
}
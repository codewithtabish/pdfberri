import { createWorker, PSM, type Worker } from 'tesseract.js';
import type { PDFPageProxy } from 'pdfjs-dist';
import { ExtractedCell } from './pdf-to-excel-types';

const LANGS = ['urd', 'eng'];
const BEST_LANG_PATH = 'https://tessdata.projectnaptha.com/4.0.0_best';
const LINE_PITCH = 30;
const LINE_HEIGHT = 20;

// One worker is reused for every page (loading language data is the slow part).
export async function createOcrWorker(): Promise<Worker> {
  let worker: Worker;
  try {
    // "best" models are far more accurate for Urdu than the default fast ones
    worker = await createWorker(LANGS, 1, { langPath: BEST_LANG_PATH });
  } catch {
    worker = await createWorker(LANGS, 1);
  }
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
    preserve_interword_spaces: '1',
  });
  return worker;
}

function enhanceContrast(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const img = ctx.getImageData(0, 0, width, height);
  const d = img.data;
  const hist = new Uint32Array(256);

  for (let i = 0; i < d.length; i += 4) {
    const g = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    d[i] = d[i + 1] = d[i + 2] = g;
    hist[g]++;
  }

  const total = width * height;
  let acc = 0;
  let low = 0;
  let high = 255;
  for (let v = 0; v < 256; v++) {
    acc += hist[v];
    if (acc >= total * 0.01) { low = v; break; }
  }
  acc = 0;
  for (let v = 255; v >= 0; v--) {
    acc += hist[v];
    if (acc >= total * 0.01) { high = v; break; }
  }

  if (high - low > 20) {
    const range = high - low;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.max(0, Math.min(255, ((d[i] - low) * 255) / range));
      d[i] = d[i + 1] = d[i + 2] = v;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function isNoiseLine(line: string): boolean {
  const useful = line.match(/[A-Za-z0-9\u0600-\u06FF]/g)?.length ?? 0;
  return useful < 2 || useful / line.length < 0.4;
}

export async function extractTextViaOcr(page: PDFPageProxy, worker: Worker): Promise<ExtractedCell[]> {
  const base = page.getViewport({ scale: 1 });
  // Aim for ~3200px on the long side: sharp enough for Arabic-script OCR
  const scale = Math.min(4, Math.max(2, 3200 / Math.max(base.width, base.height)));
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not create canvas context');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  try {
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    enhanceContrast(ctx, canvas.width, canvas.height);

    const { data } = await worker.recognize(canvas);

    const cells: ExtractedCell[] = [];
    let y = 0;
    let blankBefore = false;

    for (const raw of data.text.split('\n')) {
      const text = raw.replace(/\s+/g, ' ').trim();
      if (!text) {
        blankBefore = true;
        continue;
      }
      if (isNoiseLine(text)) continue;

      // Synthetic y: a blank line in the OCR output becomes a bigger gap (paragraph break)
      y -= blankBefore && cells.length > 0 ? LINE_PITCH * 2.5 : LINE_PITCH;
      blankBefore = false;
      cells.push({ text, x: 0, y, width: 1, height: LINE_HEIGHT });
    }
    return cells;
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}
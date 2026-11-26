import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { THUMBNAIL_WIDTH } from "./pdf-to-powerpoint-constants";
import { ConverterError, toConverterError } from "./pdf-to-powerpoint-errors";

export type PdfjsModule = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfjsModule> | null = null;

export function loadPdfjs(): Promise<PdfjsModule> {
  pdfjsPromise ??= import("pdfjs-dist").then((module) => {
    module.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    return module;
  });
  return pdfjsPromise;
}

export async function openPdf(file: File): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data, isEvalSupported: false });
  try {
    return await task.promise;
  } catch (error) {
    await task.destroy().catch(() => undefined);
    throw toConverterError(error);
  }
}

export function releaseCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

interface RenderOptions {
  scale: number;
  offsetX?: number;
  offsetY?: number;
  width?: number;
  height?: number;
  signal?: AbortSignal;
}

export async function renderPageToCanvas(
  page: PDFPageProxy,
  options: RenderOptions,
): Promise<HTMLCanvasElement> {
  const { scale, offsetX = 0, offsetY = 0, signal } = options;
  const viewport = page.getViewport({ scale, offsetX, offsetY });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(options.width ?? viewport.width));
  canvas.height = Math.max(1, Math.floor(options.height ?? viewport.height));
  const context = canvas.getContext("2d");
  if (!context) {
    releaseCanvas(canvas);
    throw new ConverterError("MEMORY");
  }

  const task = page.render({ canvas, canvasContext: context, viewport });
  const onAbort = () => task.cancel();
  signal?.addEventListener("abort", onAbort, { once: true });
  try {
    await task.promise;
  } catch {
    releaseCanvas(canvas);
    throw new ConverterError(signal?.aborted ? "CANCELLED" : "RENDER_FAILED");
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
  return canvas;
}

// ---- Lazy thumbnails: sequential queue + per-document cache ----

const thumbnailCache = new WeakMap<PDFDocumentProxy, Map<number, string>>();
let thumbnailQueue: Promise<unknown> = Promise.resolve();

export function getThumbnail(doc: PDFDocumentProxy, pageIndex: number): Promise<string> {
  let cache = thumbnailCache.get(doc);
  if (!cache) {
    cache = new Map();
    thumbnailCache.set(doc, cache);
  }
  const hit = cache.get(pageIndex);
  if (hit) return Promise.resolve(hit);

  const store = cache;
  const job = thumbnailQueue.then(async () => {
    const page = await doc.getPage(pageIndex + 1);
    try {
      const base = page.getViewport({ scale: 1 });
      const canvas = await renderPageToCanvas(page, { scale: THUMBNAIL_WIDTH / base.width });
      const url = canvas.toDataURL("image/jpeg", 0.7);
      releaseCanvas(canvas);
      store.set(pageIndex, url);
      return url;
    } finally {
      page.cleanup();
    }
  });
  thumbnailQueue = job.catch(() => undefined);
  return job;
}

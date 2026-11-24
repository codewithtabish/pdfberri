// src/components/pages/tools/edit-pdf/edit-pdf-renderer.ts

import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";
import { EDIT_PDF_CONFIG } from "./edit-pdf-constants";

const activeTasks = new Map<string, RenderTask>();

/**
 * Cancel any in-flight render for a given key
 */
export function cancelRender(key: string) {
  const task = activeTasks.get(key);
  if (task) {
    task.cancel();
    activeTasks.delete(key);
  }
}

/**
 * Render a full page onto a canvas at the given scale.
 * Accepts exactly 3 arguments as passed by edit-pdf-page-canvas.tsx:
 * (page, canvas, scale)
 */
export async function renderPageToCanvas(
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  scale: number,
  rotation: 0 | 90 | 180 | 270 = 0,
  key?: string
): Promise<void> {
  if (key) cancelRender(key);

  const dpr = Math.min(
    window.devicePixelRatio || 1,
    EDIT_PDF_CONFIG.MAX_DEVICE_PIXEL_RATIO || 2
  );

  const viewport = page.getViewport({ scale: scale * dpr, rotation });

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  canvas.style.width = `${viewport.width / dpr}px`;
  canvas.style.height = `${viewport.height / dpr}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D context");
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Render
  const renderTask = page.render({
    canvasContext: ctx,
    canvas,
    viewport,
  });

  if (key) activeTasks.set(key, renderTask);

  try {
    await renderTask.promise;
  } catch (err: unknown) {
    if ((err as { name?: string })?.name === "RenderingCancelledException") {
      return;
    }
    throw err;
  } finally {
    if (key) activeTasks.delete(key);
  }
}

/**
 * Generate a low-resolution thumbnail data URL
 */
export async function generateThumbnail(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  maxWidth = EDIT_PDF_CONFIG.THUMBNAIL_WIDTH || 120,
  maxHeight = EDIT_PDF_CONFIG.THUMBNAIL_HEIGHT || 160
): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const unscaled = page.getViewport({ scale: 1 });

  const scale = Math.min(
    maxWidth / unscaled.width,
    maxHeight / unscaled.height,
    1
  );

  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    page.cleanup();
    throw new Error("Could not get 2D context for thumbnail");
  }

  await page.render({
    canvasContext: ctx,
    canvas,
    viewport,
  }).promise;

  page.cleanup();

  return canvas.toDataURL("image/jpeg", 0.72);
}

/**
 * Clean up all active render tasks (call on unmount)
 */
export function cancelAllRenders() {
  for (const task of activeTasks.values()) {
    task.cancel();
  }
  activeTasks.clear();
}
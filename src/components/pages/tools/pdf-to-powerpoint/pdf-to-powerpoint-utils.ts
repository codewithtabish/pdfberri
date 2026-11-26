import {
  FIXED_SLIDE_SIZES,
  MAX_CANVAS_PIXELS,
  MAX_SLIDE_INCHES,
  MIN_SLIDE_INCHES,
} from "./pdf-to-powerpoint-constants";
import type { FitMode, SlideSize, SlideSizeOption } from "./pdf-to-powerpoint-types";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function buildOutputFileName(originalName: string): string {
  const base = originalName
    .replace(/\.pdf$/i, "")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return `${base || "presentation"}.pptx`;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function computeSlideSize(
  option: SlideSizeOption,
  firstPage: { width: number; height: number },
): SlideSize {
  if (option !== "match") return FIXED_SLIDE_SIZES[option];
  let width = firstPage.width / 72;
  let height = firstPage.height / 72;
  const longest = Math.max(width, height);
  if (longest > MAX_SLIDE_INCHES) {
    const k = MAX_SLIDE_INCHES / longest;
    width *= k;
    height *= k;
  }
  return {
    width: clamp(width, MIN_SLIDE_INCHES, MAX_SLIDE_INCHES),
    height: clamp(height, MIN_SLIDE_INCHES, MAX_SLIDE_INCHES),
  };
}

export interface FitResult {
  /** Slide inches per PDF point. Uniform on both axes: no distortion. */
  scale: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function computeFit(
  pageWidth: number,
  pageHeight: number,
  slideWidth: number,
  slideHeight: number,
  mode: FitMode,
): FitResult {
  const sx = slideWidth / pageWidth;
  const sy = slideHeight / pageHeight;
  const scale = mode === "cover" ? Math.max(sx, sy) : Math.min(sx, sy);
  const width = pageWidth * scale;
  const height = pageHeight * scale;
  return { scale, width, height, x: (slideWidth - width) / 2, y: (slideHeight - height) / 2 };
}

/**
 * PDF user space (origin bottom-left, y up) to viewport space (origin top-left,
 * y down, rotation applied). `view` is the crop box [x0, y0, x1, y1].
 */
export function pdfUserToViewport(
  x: number,
  y: number,
  view: readonly [number, number, number, number],
  rotation: 0 | 90 | 180 | 270,
): { x: number; y: number } {
  const w = view[2] - view[0];
  const h = view[3] - view[1];
  const lx = x - view[0];
  const ly = y - view[1];
  switch (rotation) {
    case 0:
      return { x: lx, y: h - ly };
    case 90:
      return { x: ly, y: lx };
    case 180:
      return { x: w - lx, y: ly };
    case 270:
      return { x: h - ly, y: w - lx };
  }
}

export function viewportToSlide(px: number, py: number, fit: FitResult): { x: number; y: number } {
  return { x: fit.x + px * fit.scale, y: fit.y + py * fit.scale };
}

/** Returns a factor <= 1 that keeps a canvas within MAX_CANVAS_PIXELS. */
export function limitCanvasFactor(width: number, height: number): number {
  const pixels = width * height;
  return pixels <= MAX_CANVAS_PIXELS ? 1 : Math.sqrt(MAX_CANVAS_PIXELS / pixels);
}

export function estimateImageSlidesBytes(
  slideCount: number,
  slide: SlideSize,
  dpi: number,
  png: boolean,
): number {
  const pixels = slide.width * dpi * slide.height * dpi;
  return slideCount * pixels * (png ? 0.8 : 0.25);
}

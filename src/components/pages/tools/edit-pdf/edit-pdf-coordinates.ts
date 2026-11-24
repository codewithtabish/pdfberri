// src/components/pages/tools/edit-pdf/edit-pdf-coordinates.ts

/**
 * Generate a unique ID (used by the engine).
 */
export function generateId(prefix: string): string {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return `${prefix}-${random}`;
}

/**
 * Convert PDF user-space (origin bottom-left) to canvas coordinates.
 */
export function pdfToCanvas(
  pdfX: number,
  pdfY: number,
  pageHeight: number,
  scale: number,
): { x: number; y: number } {
  return { x: pdfX * scale, y: (pageHeight - pdfY) * scale };
}

/**
 * Convert canvas (screen) coordinates to PDF user-space.
 */
export function canvasToPdf(
  canvasX: number,
  canvasY: number,
  pageHeight: number,
  scale: number,
): { x: number; y: number } {
  return { x: canvasX / scale, y: pageHeight - canvasY / scale };
}

/**
 * Bounding box for a text object in PDF coordinates.
 */
export function getTextBounds(obj: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  return {
    x1: obj.x,
    y1: obj.y - obj.height,
    x2: obj.x + obj.width,
    y2: obj.y,
  };
}
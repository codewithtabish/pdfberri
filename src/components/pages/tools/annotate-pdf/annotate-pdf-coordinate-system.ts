// src/components/pages/tools/annotate-pdf/annotate-pdf-coordinate-system.ts
import type { Point } from "./annotate-pdf-types";

// We store every point as a 0..1 fraction of the rendered page.
// pdf-lib uses bottom-left origin (points). We convert on export.

export type PageInfo = {
  widthPt: number;   // PDF points
  heightPt: number;
  rotation: number;  // 0/90/180/270
};

// normalized top-left origin (0..1) -> PDF points, bottom-left origin
export function normToPdf(
  x: number,
  y: number,
  page: PageInfo
): { x: number; y: number } {
  // W and H are the *displayed* dimensions (after rotation)
  const { W, H } = displayedDims(page);
  return { x: x * W, y: (1 - y) * H };
}

export function displayedDims(page: PageInfo) {
  const swap = page.rotation === 90 || page.rotation === 270;
  return {
    W: swap ? page.heightPt : page.widthPt,
    H: swap ? page.widthPt : page.heightPt,
  };
}

export function normPointsToPdf(points: Point[], page: PageInfo) {
  return points.map((p) => normToPdf(p.x, p.y, page));
}
import {
  LIMITS,
  MARGIN_PT,
  PAGE_SIZES_PT,
  PX_TO_PT,
} from "./jpg-to-pdf-config";
import type {
  Box,
  ExifOrientation,
  PageLayout,
  PdfSettings,
  PlacedImage,
} from "./jpg-to-pdf-types";

/** Clockwise rotation implied by a non-mirrored EXIF orientation. */
export function exifRotationCw(orientation: ExifOrientation): 0 | 90 | 180 | 270 {
  if (orientation === 3) return 180;
  if (orientation === 6) return 90;
  if (orientation === 8) return 270;
  return 0;
}

export function isMirroredOrientation(orientation: ExifOrientation): boolean {
  return orientation === 2 || orientation === 4 || orientation === 5 || orientation === 7;
}

export function isSwappedOrientation(orientation: ExifOrientation): boolean {
  return orientation >= 5;
}

function effectiveMargin(pageWidth: number, pageHeight: number, margin: number) {
  return Math.min(margin, Math.min(pageWidth, pageHeight) * 0.25);
}

/** Page size in PDF points for an image with the given effective size (px). */
export function resolvePageSize(
  settings: PdfSettings,
  imageWidthPx: number,
  imageHeightPx: number,
): { width: number; height: number } {
  const margin = MARGIN_PT[settings.margin];

  if (settings.pageSize === "fit") {
    let width = imageWidthPx * PX_TO_PT;
    let height = imageHeightPx * PX_TO_PT;
    const maxSide = LIMITS.maxPageSidePt - margin * 2;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    width *= scale;
    height *= scale;
    return { width: width + margin * 2, height: height + margin * 2 };
  }

  const base = PAGE_SIZES_PT[settings.pageSize];
  const short = Math.min(base.width, base.height);
  const long = Math.max(base.width, base.height);
  const landscape =
    settings.orientation === "landscape" ||
    (settings.orientation === "auto" && imageWidthPx > imageHeightPx);
  return landscape ? { width: long, height: short } : { width: short, height: long };
}

/**
 * Computes where the image's bounding box goes on the page (PDF points,
 * origin bottom-left). `imageWidthPx/HeightPx` are the dimensions as they
 * appear after all rotation.
 */
export function computePageLayout(
  imageWidthPx: number,
  imageHeightPx: number,
  settings: PdfSettings,
): PageLayout {
  const page = resolvePageSize(settings, imageWidthPx, imageHeightPx);
  const margin =
    settings.pageSize === "fit"
      ? MARGIN_PT[settings.margin]
      : effectiveMargin(page.width, page.height, MARGIN_PT[settings.margin]);

  const content: Box = {
    x: margin,
    y: margin,
    width: page.width - margin * 2,
    height: page.height - margin * 2,
  };

  let width: number;
  let height: number;
  if (settings.fitMode === "stretch") {
    width = content.width;
    height = content.height;
  } else {
    const scaleX = content.width / imageWidthPx;
    const scaleY = content.height / imageHeightPx;
    const scale = settings.fitMode === "cover" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
    width = imageWidthPx * scale;
    height = imageHeightPx * scale;
  }

  return {
    pageWidth: page.width,
    pageHeight: page.height,
    content,
    image: {
      x: content.x + (content.width - width) / 2,
      y: content.y + (content.height - height) / 2,
      width,
      height,
    },
  };
}

/**
 * Turns the rotated bounding box into the lower-left origin, unrotated size
 * and counter-clockwise angle that pdf-lib's drawImage needs.
 */
export function placeRotatedImage(box: Box, rotationCw: number): PlacedImage {
  const turn = ((Math.round(rotationCw / 90) % 4) + 4) % 4; // 0..3 clockwise quarter turns
  const swapped = turn % 2 === 1;
  const width = swapped ? box.height : box.width;
  const height = swapped ? box.width : box.height;

  // Counter-clockwise rotation by -turn*90°: [cos, sin] per turn.
  const cos = [1, 0, -1, 0][turn];
  const sin = [0, -1, 0, 1][turn];

  const corners = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ].map(([px, py]) => [px * cos - py * sin, px * sin + py * cos]);

  const minX = Math.min(...corners.map((c) => c[0]));
  const minY = Math.min(...corners.map((c) => c[1]));

  return {
    x: box.x - minX,
    y: box.y - minY,
    width,
    height,
    angle: -turn * 90,
  };
}

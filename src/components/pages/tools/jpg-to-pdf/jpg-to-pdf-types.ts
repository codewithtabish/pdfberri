export type ImageKind = "jpg" | "png";
export type ImageMime = "image/jpeg" | "image/png";
export type ImageRotation = 0 | 90 | 180 | 270;
export type ExifOrientation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type PageSizeId = "a4" | "a3" | "a5" | "letter" | "legal" | "fit";
export type OrientationId = "auto" | "portrait" | "landscape";
export type MarginId = "none" | "small" | "medium" | "large";
export type FitModeId = "contain" | "cover" | "stretch";
export type QualityId = "standard" | "high" | "original";

export interface PdfSettings {
  pageSize: PageSizeId;
  orientation: OrientationId;
  margin: MarginId;
  fitMode: FitModeId;
  quality: QualityId;
}

/** Result of reading an image file's header (no full decode). */
export interface ImageHeader {
  kind: ImageKind;
  mime: ImageMime;
  /** Stored pixel dimensions (before EXIF orientation). */
  width: number;
  height: number;
  exifOrientation: ExifOrientation;
}

export interface ImageItem extends ImageHeader {
  id: string;
  file: File;
  name: string;
  size: number;
  /** Pixel dimensions as displayed (after EXIF orientation). */
  displayWidth: number;
  displayHeight: number;
  /** Extra clockwise rotation chosen by the user. */
  rotation: ImageRotation;
  previewUrl: string;
}

export interface ValidationIssue {
  fileName: string;
  message: string;
}

export type ConversionStage = "preparing" | "embedding" | "saving";

export interface ConversionProgress {
  stage: ConversionStage;
  current: number;
  total: number;
  fileName: string | null;
  /** 0 – 1, based on real completed work. */
  fraction: number;
}

export interface ConversionResult {
  blob: Blob;
  fileName: string;
  size: number;
  pageCount: number;
  pageSize: PageSizeId;
  orientation: OrientationId;
}

export type ConversionStatus =
  | { phase: "idle" }
  | { phase: "converting"; progress: ConversionProgress }
  | { phase: "success"; result: ConversionResult }
  | { phase: "error"; message: string };

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageLayout {
  pageWidth: number;
  pageHeight: number;
  /** Area inside the margins (PDF points, origin bottom-left). */
  content: Box;
  /** Bounding box of the (rotated) image. May exceed `content` for cover. */
  image: Box;
}

export interface PlacedImage {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Counter-clockwise degrees, as pdf-lib expects. */
  angle: number;
}

import type {
  FitModeId,
  MarginId,
  OrientationId,
  PageSizeId,
  QualityId,
  PdfSettings,
} from "./jpg-to-pdf-types";

/** Conservative browser-memory limits. Tune here only. */
export const LIMITS = {
  maxImages: 100,
  maxFileBytes: 25 * 1024 * 1024,
  maxTotalBytes: 300 * 1024 * 1024,
  maxDimension: 16384,
  maxPixelsPerImage: 64_000_000,
  maxOutputBytes: 400 * 1024 * 1024,
  /** PDF spec maximum page side in points. */
  maxPageSidePt: 14400,
} as const;

export const ACCEPT_ATTRIBUTE = "image/jpeg,image/png,.jpg,.jpeg,.png";
export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"] as const;

/** 1 image pixel = 0.75 pt (96 CSS dpi → 72 pt/in) for "Fit to image". */
export const PX_TO_PT = 0.75;

/** Portrait dimensions in PDF points (72 pt = 1 in). */
export const PAGE_SIZES_PT: Record<
  Exclude<PageSizeId, "fit">,
  { width: number; height: number }
> = {
  a3: { width: 841.89, height: 1190.55 },
  a4: { width: 595.28, height: 841.89 },
  a5: { width: 419.53, height: 595.28 },
  letter: { width: 612, height: 792 },
  legal: { width: 612, height: 1008 },
};

export const MARGIN_PT: Record<MarginId, number> = {
  none: 0,
  small: 28.35, // 10 mm
  medium: 56.69, // 20 mm
  large: 85.04, // 30 mm
};

/** null = embed the original bytes untouched. */
export const QUALITY_PROFILES: Record<
  QualityId,
  { maxSide: number; jpegQuality: number } | null
> = {
  standard: { maxSide: 1800, jpegQuality: 0.75 },
  high: { maxSide: 3200, jpegQuality: 0.9 },
  original: null,
};

export const DEFAULT_SETTINGS: PdfSettings = {
  pageSize: "a4",
  orientation: "auto",
  margin: "small",
  fitMode: "contain",
  quality: "original",
};

export interface OptionDef<T extends string> {
  value: T;
  label: string;
}

export const PAGE_SIZE_OPTIONS: OptionDef<PageSizeId>[] = [
  { value: "a4", label: "A4" },
  { value: "a3", label: "A3" },
  { value: "a5", label: "A5" },
  { value: "letter", label: "Letter" },
  { value: "legal", label: "Legal" },
  { value: "fit", label: "Fit to image" },
];

export const ORIENTATION_OPTIONS: OptionDef<OrientationId>[] = [
  { value: "auto", label: "Auto" },
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
];

export const MARGIN_OPTIONS: OptionDef<MarginId>[] = [
  { value: "none", label: "None" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export const FIT_MODE_OPTIONS: OptionDef<FitModeId>[] = [
  { value: "contain", label: "Contain" },
  { value: "cover", label: "Cover" },
  { value: "stretch", label: "Stretch" },
];

export const QUALITY_OPTIONS: OptionDef<QualityId>[] = [
  { value: "standard", label: "Standard" },
  { value: "high", label: "High" },
  { value: "original", label: "Original" },
];

export const FIT_MODE_HINTS: Record<FitModeId, string> = {
  contain: "Shows the whole image, centered, with its proportions kept.",
  cover: "Fills the page area and crops any overflowing edges.",
  stretch: "Fills the page area and may distort the image.",
};

export const QUALITY_HINTS: Record<QualityId, string> = {
  standard:
    "Images longer than 1800 px are resized and re-compressed (JPEG 75%). Smaller images are embedded untouched.",
  high: "Images longer than 3200 px are resized and re-compressed (JPEG 90%). Smaller images are embedded untouched.",
  original:
    "Embeds your original image data without re-compression. Nothing is resized.",
};

export const ORIENTATION_LABELS: Record<OrientationId, string> = {
  auto: "Auto",
  portrait: "Portrait",
  landscape: "Landscape",
};

export const PAGE_SIZE_LABELS: Record<PageSizeId, string> = {
  a4: "A4",
  a3: "A3",
  a5: "A5",
  letter: "Letter",
  legal: "Legal",
  fit: "Fit to image",
};

export const DEFAULT_OUTPUT_NAME = "pdfberri-images-to-pdf.pdf";

export const JPG_TO_PDF_FAQS: { question: string; answer: string }[] = [
  {
    question: "Which image formats can I convert?",
    answer:
      "JPG, JPEG and PNG files. Each file is checked by its actual content, not only its extension, so a renamed file or a damaged image is reported instead of being skipped.",
  },
  {
    question: "Are my images uploaded to a server?",
    answer:
      "No. The PDF is built entirely in your browser. Your images are never sent to PDFBerri, and nothing is stored after you close or reset the page.",
  },
  {
    question: "Does converting to PDF change my image quality?",
    answer:
      "With the Original setting, your image data is embedded as it is, with no re-compression. PDF cannot improve a JPG, because JPG is already a compressed format. Standard and High only resize and re-compress images that are larger than their limit, which makes smaller files.",
  },
  {
    question: "Why did my photo appear rotated in another tool?",
    answer:
      "Phone photos often store a rotation flag. PDFBerri reads it so photos appear upright. If an image still needs turning, use the rotate button on its card.",
  },
  {
    question: "What is the difference between Contain, Cover and Stretch?",
    answer:
      "Contain shows the whole image with its proportions. Cover fills the page area and crops the edges. Stretch fills the page area and can distort the image.",
  },
  {
    question: "How many images can I add?",
    answer:
      "Up to 100 images, 25 MB each and 300 MB in total. Because conversion runs on your device, very large batches depend on your available memory. If a batch fails, try fewer images or the Standard setting.",
  },
];

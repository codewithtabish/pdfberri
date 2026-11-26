import type {
  ConversionSettings,
  ProcessingStage,
  QualityOption,
  SlideSize,
} from "./pdf-to-powerpoint-types";

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
export const MAX_PAGES = 500;
export const MAX_SELECTED_PAGES = 300;
export const MAX_CANVAS_PIXELS = 16_000_000;
export const MAX_IMAGE_SIDE = 2400;
export const MAX_ESTIMATED_OUTPUT_BYTES = 500 * 1024 * 1024;
export const MIN_SLIDE_INCHES = 1;
export const MAX_SLIDE_INCHES = 56;
export const PREVIEW_DPI = 72;
export const THUMBNAIL_WIDTH = 140;
export const VECTOR_OP_THRESHOLD = 3;

export const FIXED_SLIDE_SIZES: Record<"16:9" | "4:3", SlideSize> = {
  "16:9": { width: 13.333, height: 7.5 },
  "4:3": { width: 10, height: 7.5 },
};

export const QUALITY_DPI: Record<QualityOption, number> = {
  standard: 110,
  high: 160,
  max: 220,
};

export const QUALITY_LABELS: Record<QualityOption, { label: string; hint: string }> = {
  standard: { label: "Standard", hint: "Smaller file" },
  high: { label: "High", hint: "Balanced" },
  max: { label: "Maximum", hint: "Largest file" },
};

export const DEFAULT_SETTINGS: ConversionSettings = {
  mode: "editable",
  slideSize: "16:9",
  fit: "contain",
  quality: "high",
  vectorPolicy: "fallback",
  addSlideNumbers: false,
};

export const STAGE_LABELS: Record<ProcessingStage, string> = {
  loading: "Loading PDF",
  rendering: "Converting pages",
  building: "Building PowerPoint",
  validating: "Validating output",
  preparing: "Preparing download",
};

export const PPTX_MIME =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";

// Verify these hrefs against your route registry.
export const POPULAR_TOOLS = [
  { id: "merge", label: "Merge PDF", href: "/tools/merge-pdf" },
  { id: "split", label: "Split PDF", href: "/tools/split-pdf" },
  { id: "compress", label: "Compress PDF", href: "/tools/compress-pdf" },
  { id: "pdf-to-word", label: "PDF to Word", href: "/tools/pdf-to-word" },
  { id: "word-to-pdf", label: "Word to PDF", href: "/tools/word-to-pdf" },
  { id: "pdf-to-excel", label: "PDF to Excel", href: "/tools/pdf-to-excel" },
  { id: "excel-to-pdf", label: "Excel to PDF", href: "/tools/excel-to-pdf" },
  { id: "pdf-to-jpg", label: "PDF to JPG", href: "/tools/pdf-to-jpg" },
] as const;

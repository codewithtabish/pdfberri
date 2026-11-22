// src/components/pages/tools/word-to-pdf/word-to-pdf-constants.ts

import type {
  PageSizeOption,
  QualityOption,
  WordToPdfLimits,
  WordToPdfSettings,
} from "./word-to-pdf-types";

export const WORD_TO_PDF_ROUTE = "/tools/word-to-pdf";
export const WORD_TO_PDF_API_ROUTE = "/api/tools/word-to-pdf";
export const TOOLS_INDEX_ROUTE = "/tools";

export const WORD_TO_PDF_TITLE =
  "Word to PDF Converter — Convert Word Documents to PDF | PDFBerri";
export const WORD_TO_PDF_DESCRIPTION =
  "Convert Word documents to PDF with PDFBerri. DOCX files are converted privately in your browser, and nothing is uploaded without your consent.";

const MB = 1024 * 1024;

/**
 * Single place for every limit. Change numbers here, not in components.
 * Server-side limits are read from environment variables in
 * src/lib/word-to-pdf/word-to-pdf-server.ts.
 */
export const WORD_TO_PDF_LIMITS: WordToPdfLimits = {
  maxFileBytes: 50 * MB,
  maxLegacyFileBytes: 25 * MB,
  maxPages: 250,
  maxZipEntries: 4_000,
  maxUncompressedBytes: 400 * MB,
  maxCompressionRatio: 100,
  ratioCheckMinBytes: 20 * MB,
};

export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const DOC_MIME = "application/msword";
export const PDF_MIME = "application/pdf";

/** MIME types browsers commonly report for Word files (empty string = unknown). */
export const ALLOWED_INPUT_MIME_TYPES: ReadonlySet<string> = new Set([
  "",
  DOCX_MIME,
  DOC_MIME,
  "application/vnd.ms-word",
  "application/octet-stream",
  "application/zip",
  "application/x-zip-compressed",
]);

export const FILE_INPUT_ACCEPT = `.docx,.doc,${DOCX_MIME},${DOC_MIME}`;

export const PAGE_SIZES_PT: Record<
  Exclude<PageSizeOption, "original">,
  readonly [number, number]
> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

export interface QualityPreset {
  label: string;
  hint: string;
  /** html2canvas device-pixel scale. */
  scale: number;
  jpegQuality: number;
}

export const QUALITY_PRESETS: Record<QualityOption, QualityPreset> = {
  standard: {
    label: "Standard",
    hint: "Smaller file",
    scale: 1.5,
    jpegQuality: 0.85,
  },
  high: {
    label: "High",
    hint: "Balanced",
    scale: 2,
    jpegQuality: 0.92,
  },
  maximum: {
    label: "Maximum",
    hint: "Sharpest, larger file",
    scale: 3,
    jpegQuality: 0.95,
  },
};

export const DEFAULT_SETTINGS: WordToPdfSettings = {
  pageSize: "original",
  quality: "high",
};

export const PAGE_SIZE_OPTIONS: ReadonlyArray<{
  value: PageSizeOption;
  label: string;
}> = [
  { value: "original", label: "Original" },
  { value: "a4", label: "A4" },
  { value: "letter", label: "Letter" },
];

export const QUALITY_OPTIONS: ReadonlyArray<{
  value: QualityOption;
  label: string;
}> = [
  { value: "standard", label: QUALITY_PRESETS.standard.label },
  { value: "high", label: QUALITY_PRESETS.high.label },
  { value: "maximum", label: QUALITY_PRESETS.maximum.label },
];

/** Largest canvas (in pixels) we ask the browser to allocate per page. */
export const MAX_CANVAS_PIXELS = 16_777_216;

export const CLOUD_DEFAULT_TIMEOUT_MS = 150_000;

export interface NextToolLink {
  name: string;
  description: string;
  href: string;
  icon:
    | "word"
    | "compress"
    | "merge"
    | "protect"
    | "split"
    | "rotate";
}

export const NEXT_TOOLS: readonly NextToolLink[] = [
  {
    name: "PDF to Word",
    description: "Convert PDFs back to editable Word documents.",
    href: "/tools/pdf-to-word",
    icon: "word",
  },
  {
    name: "Compress PDF",
    description: "Reduce PDF file size for sharing.",
    href: "/tools/compress-pdf",
    icon: "compress",
  },
  {
    name: "Merge PDF",
    description: "Combine multiple PDFs into one file.",
    href: "/tools/merge-pdf",
    icon: "merge",
  },
  {
    name: "Protect PDF",
    description: "Add a password to your document.",
    href: "/tools/protect-pdf",
    icon: "protect",
  },
  {
    name: "Split PDF",
    description: "Extract pages or split into separate files.",
    href: "/tools/split-pdf",
    icon: "split",
  },
  {
    name: "Rotate PDF",
    description: "Fix the orientation of PDF pages.",
    href: "/tools/rotate-pdf",
    icon: "rotate",
  },
];

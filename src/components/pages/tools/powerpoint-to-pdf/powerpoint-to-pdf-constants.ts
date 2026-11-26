import type { PdfToolIconKey } from "@/components/general/icons/pdf-icons";
import type { PptOrientation, PptPageSize, PptSettings } from "./powerpoint-to-pdf-types";

export const API_BASE = "/api/tools/powerpoint-to-pdf/jobs";

// Keep in sync with PPT_MAX_UPLOAD_BYTES (Next) and MAX_UPLOAD_BYTES (worker).
export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_SLIDES = 500;
export const RETENTION_MINUTES = 30;

export const POLL_INTERVAL_MS = 1000;
export const POLL_MAX_TRANSIENT_FAILURES = 3;

export const ACCEPTED_EXTENSIONS = [".ppt", ".pptx"] as const;
export const ACCEPT_ATTRIBUTE =
  ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

export const PAGE_SIZE_OPTIONS: ReadonlyArray<{ value: PptPageSize; label: string }> = [
  { value: "original", label: "Preserve Original Size" },
  { value: "a4", label: "A4" },
  { value: "letter", label: "US Letter" },
];

export const ORIENTATION_OPTIONS: ReadonlyArray<{ value: PptOrientation; label: string }> = [
  { value: "auto", label: "Automatic" },
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
];

export const PROCESSING_STAGES = [
  { state: "queued", label: "Waiting for a free converter" },
  { state: "validating", label: "Checking the file" },
  { state: "inspecting", label: "Reading the slides" },
  { state: "converting", label: "Converting slides to PDF" },
  { state: "verifying", label: "Verifying the PDF" },
] as const;

export const DEFAULT_SETTINGS: PptSettings = {
  selection: { mode: "all" },
  pageSize: "original",
  orientation: "auto",
  includeHidden: false,
};

export const POPULAR_TOOLS: ReadonlyArray<{ slug: PdfToolIconKey; label: string }> = [
  { slug: "merge-pdf", label: "Merge PDF" },
  { slug: "split-pdf", label: "Split PDF" },
  { slug: "compress-pdf", label: "Compress PDF" },
  { slug: "pdf-to-word", label: "PDF to Word" },
  { slug: "word-to-pdf", label: "Word to PDF" },
  { slug: "pdf-to-excel", label: "PDF to Excel" },
  { slug: "excel-to-pdf", label: "Excel to PDF" },
  { slug: "pdf-to-powerpoint", label: "PDF to PowerPoint" },
];

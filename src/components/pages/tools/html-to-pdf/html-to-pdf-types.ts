/**
 * PDFBerri HTML → PDF — Core Types
 * Production-grade type definitions for the entire conversion pipeline.
 */

export type InputMode = "file" | "code" | "url";

export type PageSize = "A4" | "Letter" | "Legal" | "A3";
export type Orientation = "portrait" | "landscape" | "auto";
export type MarginPreset = "normal" | "narrow" | "wide" | "custom";

export type ConversionStage =
  | "idle"
  | "input-ready"
  | "validating"
  | "preparing"
  | "resource-loading"
  | "rendering"
  | "generating-pdf"
  | "validating-pdf"
  | "completed"
  | "cancelled"
  | "failed"
  | "timed-out";

export interface PdfSettings {
  pageSize: PageSize;
  orientation: Orientation;
  margins: MarginPreset;
  customMargins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  includeBackgroundGraphics: boolean;
  printBackground: boolean;
  pageNumbers: boolean;
  headerText?: string;
  footerText?: string;
  scale?: number;
}

export interface ConversionJob {
  id: string;
  status: ConversionStage;
  inputMode: InputMode;
  createdAt: number;
  updatedAt: number;
  progress?: number;
  stageMessage?: string;
  error?: ConversionError;
  result?: ConversionResult;
  settings: PdfSettings;
}

export interface ConversionResult {
  jobId: string;
  filename: string;
  sizeBytes: number;
  pageCount: number;
  downloadUrl: string;
  expiresAt: number;
  mimeType: "application/pdf";
}

export interface ConversionError {
  code: ConversionErrorCode;
  title: string;
  message: string;
  actionable?: string;
  retryable: boolean;
}

export type ConversionErrorCode =
  | "INVALID_HTML"
  | "EMPTY_HTML"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_EXTENSION"
  | "INVALID_URL"
  | "UNSAFE_URL"
  | "RESOURCE_LOAD_FAILED"
  | "RENDERING_TIMEOUT"
  | "BROWSER_INIT_FAILED"
  | "PDF_GENERATION_FAILED"
  | "OUTPUT_TOO_LARGE"
  | "DOWNLOAD_FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "UNSUPPORTED_CONTENT";

export interface HtmlInput {
  mode: InputMode;
  content?: string; // for code mode
  file?: File; // for file mode
  url?: string; // for url mode
  filename?: string;
}

export interface PreparedHtml {
  html: string;
  baseUrl?: string;
  resources: ResolvedResource[];
  hasExternalResources: boolean;
}

export interface ResolvedResource {
  originalUrl: string;
  type: "image" | "stylesheet" | "font" | "other";
  resolved?: string; // data URL or safe proxy URL
  status: "ok" | "failed" | "blocked" | "timeout";
  sizeBytes?: number;
}

export interface RenderOptions {
  settings: PdfSettings;
  html: string;
  baseUrl?: string;
  timeoutMs: number;
  waitUntil: "load" | "networkidle" | "domcontentloaded";
  disableJavascript: boolean;
}

export interface PdfGenerationResult {
  buffer: Buffer;
  pageCount: number;
  sizeBytes: number;
}

export const DEFAULT_PDF_SETTINGS: PdfSettings = {
  pageSize: "A4",
  orientation: "portrait",
  margins: "normal",
  includeBackgroundGraphics: true,
  printBackground: true,
  pageNumbers: false,
  scale: 1,
};

export const MARGIN_VALUES: Record<MarginPreset, { top: string; right: string; bottom: string; left: string }> = {
  normal: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
  narrow: { top: "0.25in", right: "0.25in", bottom: "0.25in", left: "0.25in" },
  wide: { top: "1in", right: "1in", bottom: "1in", left: "1in" },
  custom: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
};

export const PAGE_SIZE_DIMENSIONS: Record<PageSize, { width: string; height: string }> = {
  A4: { width: "210mm", height: "297mm" },
  Letter: { width: "8.5in", height: "11in" },
  Legal: { width: "8.5in", height: "14in" },
  A3: { width: "297mm", height: "420mm" },
};

export const LIMITS = {
  maxHtmlSizeBytes: 5 * 1024 * 1024, // 5 MB
  maxUrlResponseBytes: 10 * 1024 * 1024,
  maxResourceSizeBytes: 5 * 1024 * 1024,
  maxTotalResources: 100,
  maxOutputPdfBytes: 50 * 1024 * 1024, // 50 MB
  navigationTimeoutMs: 30_000,
  renderingTimeoutMs: 60_000,
  jobExpirationMs: 30 * 60 * 1000, // 30 min
  maxConcurrentJobsPerUser: 3,
} as const;

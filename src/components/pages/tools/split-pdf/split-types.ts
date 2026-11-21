export type SplitMethod = "selected-pages" | "page-ranges" | "every-page" | "equal-parts";

export type SplitStatus = "empty" | "loading" | "ready" | "processing" | "done";

export type SplitStage = "preparing" | "processing" | "finalizing";

export type SplitErrorCode =
  | "invalid-type"
  | "empty-file"
  | "too-large"
  | "invalid-pdf"
  | "encrypted"
  | "too-many-pages"
  | "cancelled"
  | "processing-failed";

/** The one source PDF. Page counts are one-based for display. */
export interface SourceDocument {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

/** Raw user input for a range row (strings so inputs can be edited freely). */
export interface PageRangeInput {
  id: string;
  start: string;
  end: string;
}

/**
 * One planned output PDF.
 * `pageIndices` are ZERO-based (pdf-lib). Everything user-facing is one-based.
 */
export interface SplitOutputPlan {
  id: string;
  filename: string;
  pageIndices: number[];
  pageCount: number;
  /** Human-readable, e.g. "Pages 1–5" or "Page 3" */
  label: string;
}

export type SplitPlanResult =
  | { ok: true; outputs: SplitOutputPlan[]; warning?: string }
  | { ok: false; error: string };

export interface SplitPlanContext {
  method: SplitMethod;
  totalPages: number;
  /** One-based page numbers */
  selectedPages: number[];
  ranges: PageRangeInput[];
  equalParts: string;
}

export interface SplitOutput {
  id: string;
  filename: string;
  label: string;
  pageCount: number;
  size: number;
  blob: Blob;
}

export interface SplitProgress {
  stage: SplitStage;
  /** Outputs finished so far (measurable) */
  completed: number;
  total: number;
}

export interface SplitWorkerOutputRequest {
  id: string;
  filename: string;
  pageIndices: number[];
}

export type SplitWorkerRequest = {
  type: "start";
  buffer: ArrayBuffer;
  outputs: SplitWorkerOutputRequest[];
};

export type SplitWorkerResponse =
  | { type: "progress"; stage: SplitStage; completed: number; total: number }
  | { type: "output"; id: string; bytes: ArrayBuffer }
  | { type: "done" }
  | { type: "failed"; code: SplitErrorCode; message: string };

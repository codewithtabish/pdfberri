export type MergeErrorCode =
  | "not-pdf"
  | "empty"
  | "too-large"
  | "too-many-files"
  | "total-too-large"
  | "encrypted"
  | "corrupted"
  | "memory"
  | "worker"
  | "failed"
  | "cancelled";

export type MergeStage = "preparing" | "reading" | "combining" | "finalizing";

export type MergePhase = "idle" | "processing" | "success" | "error";

export interface WorkItem {
  id: string;
  file: File;
}

export type WorkerRequest =
  | { type: "inspect"; items: WorkItem[] }
  | { type: "merge"; items: WorkItem[] };

export type WorkerResponse =
  | { type: "inspected"; id: string; pageCount: number }
  | { type: "inspect-failed"; id: string; code: MergeErrorCode }
  | { type: "progress"; stage: MergeStage; completed: number; total: number }
  | { type: "merged"; buffer: ArrayBuffer; pageCount: number }
  | { type: "merge-failed"; code: MergeErrorCode; fileId?: string };

/** pageCount === null means the file is still being inspected. */
export interface MergeFileItem {
  id: string;
  file: File;
  pageCount: number | null;
}

export interface MergeIssue {
  id: string;
  fileName: string;
  message: string;
}

export interface MergeProgress {
  stage: MergeStage;
  completed: number;
  total: number;
}

export interface MergeResult {
  url: string;
  fileName: string;
  pageCount: number;
  sizeBytes: number;
}
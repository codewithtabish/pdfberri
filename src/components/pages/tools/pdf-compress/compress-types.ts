export type CompressionMode = "recommended" | "high" | "maximum-quality" | "custom";
export type ProcessingMethod = "local" | "cloud";

export type CompressStatus =
  | "idle"
  | "file-selected"
  | "validating"
  | "ready"
  | "processing"
  | "validating-result"
  | "completed"
  | "no-reduction"
  | "failed"
  | "cancelled";

export type CompressErrorCode =
  | "invalid-type"
  | "empty-file"
  | "too-large"
  | "too-many-pages"
  | "invalid-pdf"
  | "encrypted"
  | "engine-unavailable"
  | "worker"
  | "processing-failed"
  | "invalid-output"
  | "cancelled";

export interface CompressionSettings {
  useObjectStreams: boolean;
  stripMetadata: boolean;
  stripXmp: boolean;
  updateModificationDate: boolean;
  pruneOrphans: boolean;
}

export interface SourceDocument {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

export interface CompressResult {
  id: string;
  blob: Blob;
  filename: string;
  size: number;
  pageCount: number;
  originalSize: number;
  bytesSaved: number;
  reductionPercentage: number;
  mode: CompressionMode;
  method: ProcessingMethod;
  lossy: boolean;
}

export interface CompressProgress {
  stage: "preparing" | "optimizing" | "finalizing";
  completed: number;
  total: number;
}

export type CompressWorkerRequest = {
  type: "compress";
  buffer: ArrayBuffer;
  filename: string;
  settings: CompressionSettings;
  mode: CompressionMode;
};

export type CompressWorkerResponse =
  | { type: "progress"; stage: CompressProgress["stage"]; completed: number; total: number }
  | { type: "done"; bytes: ArrayBuffer; pageCount: number }
  | { type: "failed"; code: CompressErrorCode; message: string };
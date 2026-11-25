// src/components/pages/tools/unlock-pdf/unlock-pdf.types.ts

export type UnlockStatus =
  | "idle"
  | "validating"
  | "loading-engine"
  | "awaiting-password"
  | "processing"
  | "success"
  | "error";

export type UnlockErrorCode =
  | "invalid-type"
  | "empty-file"
  | "file-too-large"
  | "file-unreadable"
  | "corrupted"
  | "already-unlocked"
  | "incorrect-password"
  | "unsupported-encryption"
  | "engine-init-failed"
  | "processing-failed"
  | "download-failed"
  | "unknown";

export interface UnlockState {
  status: UnlockStatus;
  file: File | null;
  pageCount: number | null;
  unlockedBlob: Blob | null;
  unlockedUrl: string | null;
  error: UnlockErrorCode | null;
}

export interface UnlockEngineInput {
  fileBuffer: ArrayBuffer;
  password: string;
}

export interface UnlockEngineOutput {
  blob: Blob;
  pageCount: number;
}

export interface UnlockEngineResult {
  success: boolean;
  output?: UnlockEngineOutput;
  error?: UnlockErrorCode;
}
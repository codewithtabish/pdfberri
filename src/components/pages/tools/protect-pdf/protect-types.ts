export const PROTECT_ERROR_CODES = [
  "multiple-files",
  "invalid-type",
  "empty-file",
  "invalid-pdf",
  "file-too-large",
  "file-unreadable",
  "corrupted",
  "existing-restrictions",
  "unsupported-encryption",
  "wrong-existing-password",
  "engine-init-failed",
  "protect-failed",
  "verification-failed",
  "out-of-memory",
  "download-failed",
  "unknown",
] as const;

export type ProtectPdfErrorCode = (typeof PROTECT_ERROR_CODES)[number];

export function isProtectPdfErrorCode(value: unknown): value is ProtectPdfErrorCode {
  return typeof value === "string" && (PROTECT_ERROR_CODES as readonly string[]).includes(value);
}

/** Carries only a short code. Never put passwords or file contents in here. */
export class ProtectPdfEngineError extends Error {
  readonly code: ProtectPdfErrorCode;

  constructor(code: ProtectPdfErrorCode) {
    super(code);
    this.name = "ProtectPdfEngineError";
    this.code = code;
  }
}

export type ProtectPdfStatus =
  | "idle"
  | "validating"
  | "loading-engine"
  | "configuring"
  | "protecting"
  | "verifying"
  | "completed"
  | "error";

export interface ProtectPdfPermissions {
  print: boolean;
  copy: boolean;
  edit: boolean;
  annotate: boolean;
}

export interface ProtectPdfDocument {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  /** null while the document is locked by an existing password. */
  pageCount: number | null;
  requiresExistingPassword: boolean;
}

export interface ProtectPdfOptions {
  userPassword: string;
  existingPassword?: string;
  permissions: ProtectPdfPermissions;
}

export type ProtectPdfInspectState =
  | "plain"
  | "needs-password"
  | "unlocked"
  | "wrong-password"
  | "restricted"
  | "corrupt"
  | "unsupported-encryption";

export interface ProtectPdfInspection {
  state: ProtectPdfInspectState;
  pageCount: number | null;
}

export interface ProtectPdfVerifyParams {
  password: string;
  expectedPageCount: number;
  permissions: ProtectPdfPermissions;
}

export interface ProtectPdfVerification {
  cipher: "aes-256" | "unconfirmed";
  permissionsConfirmed: boolean;
}

export interface ProtectPdfResult {
  fileName: string;
  sizeBytes: number;
  pageCount: number;
  blobUrl: string;
  verification: ProtectPdfVerification;
  permissions: ProtectPdfPermissions;
}

export interface ProtectPdfEngine {
  readonly mode: "worker" | "main-thread" | null;
  init(): Promise<void>;
  inspectDocument(bytes: ArrayBuffer, existingPassword?: string): Promise<ProtectPdfInspection>;
  protect(bytes: ArrayBuffer, options: ProtectPdfOptions): Promise<ArrayBuffer>;
  verifyProtectedOutput(bytes: ArrayBuffer, params: ProtectPdfVerifyParams): Promise<ProtectPdfVerification>;
  dispose(): void;
}

export interface ProtectPdfJobState {
  status: ProtectPdfStatus;
  document: ProtectPdfDocument | null;
  password: string;
  confirmPassword: string;
  existingPassword: string;
  existingPasswordRejected: boolean;
  permissions: ProtectPdfPermissions;
  showValidation: boolean;
  protectRequested: boolean;
  /** True once the protected file's download has been started. */
  downloaded: boolean;
  result: ProtectPdfResult | null;
  error: ProtectPdfErrorCode | null;
}
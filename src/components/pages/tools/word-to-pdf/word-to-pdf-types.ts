// src/components/pages/tools/word-to-pdf/word-to-pdf-types.ts

export type WordFormat = "docx" | "doc";
export type EngineId = "local" | "cloud";

export type PageSizeOption = "original" | "a4" | "letter";
export type QualityOption = "standard" | "high" | "maximum";

export interface WordToPdfSettings {
  pageSize: PageSizeOption;
  quality: QualityOption;
}

export type SettingKey = keyof WordToPdfSettings;

export interface WordToPdfLimits {
  /** Maximum size for DOCX files converted in the browser. */
  maxFileBytes: number;
  /** Maximum size for DOC / server-converted files. */
  maxLegacyFileBytes: number;
  /** Maximum number of pages the browser engine will render. */
  maxPages: number;
  maxZipEntries: number;
  maxUncompressedBytes: number;
  maxCompressionRatio: number;
  ratioCheckMinBytes: number;
}

export type WordToPdfErrorCode =
  | "EMPTY_FILE"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_TYPE"
  | "EXTENSION_MISMATCH"
  | "CORRUPT_DOCUMENT"
  | "PASSWORD_PROTECTED_OR_LEGACY"
  | "UNSAFE_ARCHIVE"
  | "MULTIPLE_FILES"
  | "FILE_UNREADABLE"
  | "TOO_MANY_PAGES"
  | "ENGINE_UNAVAILABLE"
  | "CONSENT_REQUIRED"
  | "RENDER_FAILED"
  | "OUT_OF_MEMORY"
  | "INVALID_OUTPUT"
  | "NETWORK"
  | "SERVER_BUSY"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "FORBIDDEN"
  | "CANCELLED"
  | "UNKNOWN";

export interface ValidatedWordFile {
  file: File;
  format: WordFormat;
  /** Sanitised file name including the real extension. */
  safeName: string;
  /** Sanitised name without extension. */
  baseName: string;
  sizeBytes: number;
}

export type ConversionPhase =
  | "reading"
  | "rendering"
  | "building"
  | "uploading"
  | "converting"
  | "verifying";

export interface ConversionProgress {
  phase: ConversionPhase;
  message: string;
  /** Only set when the engine can genuinely measure progress. */
  completed?: number;
  total?: number;
}

export interface ConversionRequest {
  file: ValidatedWordFile;
  settings: WordToPdfSettings;
  signal: AbortSignal;
  onProgress?: (progress: ConversionProgress) => void;
}

export interface ConversionOutput {
  blob: Blob;
  fileName: string;
  sizeBytes: number;
  /** Page count when the engine knows it up front; verified after conversion. */
  pageCount: number | null;
  engine: EngineId;
}

export interface WordToPdfEngine {
  readonly id: EngineId;
  readonly label: string;
  readonly supportedFormats: readonly WordFormat[];
  readonly supportedSettings: readonly SettingKey[];
  /** True when the document never leaves the user's device. */
  readonly processesLocally: boolean;
  isAvailable(): Promise<boolean>;
  convert(request: ConversionRequest): Promise<ConversionOutput>;
}

export interface CloudCapabilities {
  available: boolean;
  maxFileBytes: number;
}

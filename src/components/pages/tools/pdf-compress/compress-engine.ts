import type { CompressProgress, CompressionMode, CompressionSettings } from "./compress-types";

export interface EngineCompressInput {
  file: File;
  mode: CompressionMode;
  settings: CompressionSettings;
  onProgress: (progress: CompressProgress) => void;
  signal?: AbortSignal;
}

export interface EngineCompressOutput {
  bytes: ArrayBuffer;
  pageCount: number;
}

export interface PdfCompressionEngine {
  readonly id: "local" | "cloud";
  readonly label: string;
  readonly supportedModes: readonly CompressionMode[];
  readonly losslessOnly: boolean;
  compress(input: EngineCompressInput): Promise<EngineCompressOutput>;
}
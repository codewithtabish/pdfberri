import type { QualityPreset, Resolution } from "./pdf-to-jpg-config";

export type ConversionStatus = "idle" | "loading" | "ready" | "processing" | "success" | "error";

export interface SourceDocument {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

export interface ConversionSettings {
  quality: QualityPreset;
  resolution: Resolution;
  pageSelection: "all" | "selected";
}

export interface OutputImage {
  pageNumber: number;
  filename: string;
  blob: Blob;
  width: number;
  height: number;
  size: number;
}

export interface ConversionResult {
  images: OutputImage[];
  zipBlob: Blob | null;
  zipFilename: string;
}
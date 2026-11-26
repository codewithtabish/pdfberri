export type ExtractStage =
  | "idle"
  | "validating"
  | "loading"
  | "extracting"
  | "completed"
  | "error";

export interface ExtractProgress {
  stage: ExtractStage;
  currentPage: number;
  totalPages: number;
  message: string;
  percent: number;
}

export interface ExtractedImage {
  id: string;
  pageNumber: number; // first page where the image appears
  pages: number[]; // every page where the image appears
  width: number;
  height: number;
  format: "jpeg" | "png" | "unknown";
  size: number;
  blob: Blob;
  url: string; // Object URL for preview/download
  fileName: string;
}

export interface ExtractResult {
  fileName: string;
  images: ExtractedImage[];
  skipped: number; // images found but could not be converted
}
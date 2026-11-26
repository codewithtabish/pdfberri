export type ConversionStage =
  | "idle"
  | "uploading"
  | "inspecting"
  | "converting"
  | "completed"
  | "error";

export interface ConversionProgress {
  stage: ConversionStage;
  message: string;
  percent: number;
}

export interface PowerPointState {
  file: File | null;
  totalSlides: number;
  outputBlob: Blob | null;
  pdfUrl: string | null;
  progress: ConversionProgress;
  error: string | null;
}
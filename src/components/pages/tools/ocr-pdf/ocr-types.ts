export type OcrStage =
  | "idle"
  | "inspecting"
  | "rendering"
  | "recognizing"
  | "generating"
  | "completed"
  | "error";

export interface OcrProgress {
  stage: OcrStage;
  currentPage: number;
  totalPages: number;
  message: string;
  percent: number;
}

export interface OcrLanguage {
  code: string;
  name: string;
}

export interface OcrWorkerMessage {
  type: "process";
  imageBuffer: ArrayBuffer;
  languages: string;
  pageIndex: number;
}

export interface OcrWorkerResponse {
  type: "success" | "error" | "progress";
  pageIndex: number;
  words?: { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }[];
  error?: string;
  progress?: number;
}
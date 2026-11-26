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

export interface ExtractResult {
  fileName: string;
  fileSize: number;
  totalPages: number;
  selectedPages: number[];
  pagesWithText: number[];
  emptyPages: number[];
  extractedText: string;
  characterCount: number;
  wordCount: number;
}
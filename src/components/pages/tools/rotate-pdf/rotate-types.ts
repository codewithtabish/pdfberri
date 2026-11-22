import type { PDFDocumentProxy } from "pdfjs-dist";

export type RotateStatus = "empty" | "loading" | "ready" | "processing" | "done";
export type RotationAngle = 0 | 90 | 180 | 270;

export interface SourceDocument {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

export interface PageState {
  originalRotation: number;
  currentRotation: number; // 0, 90, 180, 270
}

export interface RotateOutput {
  blob: Blob;
  filename: string;
  size: number;
  pageCount: number;
}
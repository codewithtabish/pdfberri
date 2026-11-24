import * as pdfjsLib from "pdfjs-dist";
import { PDF_WORKER_URL } from "./sign-pdf-constants";

pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

export async function loadPdfDocument(file: File) {
  const bytes = await file.arrayBuffer();
  // Clone buffer for pdf.js so we don't detach the original
  const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
  return { doc, originalBytes: bytes };
}
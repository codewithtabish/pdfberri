import * as pdfjsLib from "pdfjs-dist";
import { PDF_WORKER_URL } from "./sign-pdf-constants";
pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

export async function loadPdf(file: File) {
  const bytes = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
  return { doc, originalBytes: bytes };
}
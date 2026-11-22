import type { PDFDocumentProxy } from "pdfjs-dist";

export async function loadPdfPreview(file: File): Promise<PDFDocumentProxy> {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }

  // PDF.js detaches the buffer, so we create a separate copy for previewing
  const data = new Uint8Array(await file.arrayBuffer());
  try {
    return await pdfjs.getDocument({ data }).promise;
  } catch (error: any) {
    if (error.name === "PasswordException") {
      throw new Error("This PDF is password-protected and cannot be previewed.");
    }
    throw new Error("Failed to read the PDF. It may be damaged.");
  }
}

export function destroyPdf(pdf: PDFDocumentProxy | null) {
  if (pdf) void pdf.loadingTask.destroy();
}
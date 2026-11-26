import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { OcrProgress } from "./ocr-types";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

export async function processOcrPdf(
  file: File,
  languages: string[],
  onProgress: (progress: OcrProgress) => void,
  signal?: AbortSignal
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  
  // 1. Load for manipulation
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // 2. Load for rendering
  const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const totalPages = pdfJsDoc.numPages;
  const langString = languages.join("+");

  // 3. Setup the Worker
  const worker = new Worker(new URL("./ocr-worker.ts", import.meta.url), { type: "module" });

  const processPageInWorker = (imageBuffer: ArrayBuffer, pageIndex: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      const handleMessage = (e: MessageEvent) => {
        const { type, words, error, progress } = e.data;
        
        if (type === "progress") {
          // Calculate overall percent
          const pagePercent = Math.round(((pageIndex) / totalPages) * 100);
          const currentProgress = pagePercent + Math.round((progress / totalPages) * 100);
          onProgress({
            stage: "recognizing",
            currentPage: pageIndex + 1,
            totalPages,
            message: `Recognizing text on page ${pageIndex + 1}...`,
            percent: Math.min(currentProgress, 99),
          });
        } else if (type === "success") {
          worker.removeEventListener("message", handleMessage);
          resolve(words);
        } else if (type === "error") {
          worker.removeEventListener("message", handleMessage);
          reject(new Error(error));
        }
      };
      
      worker.addEventListener("message", handleMessage);
      worker.postMessage({ type: "process", imageBuffer, languages: langString, pageIndex }, [imageBuffer]);
    });
  };

  try {
    // 4. Process page by page
    for (let i = 1; i <= totalPages; i++) {
      if (signal?.aborted) throw new Error("Processing cancelled");

      onProgress({
        stage: "rendering",
        currentPage: i,
        totalPages,
        message: `Rendering page ${i} of ${totalPages}...`,
        percent: Math.round(((i - 1) / totalPages) * 100),
      });

      const page = await pdfJsDoc.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); 
      
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");

      await page.render({ canvasContext: ctx, viewport, canvas }).promise;

      if (signal?.aborted) throw new Error("Processing cancelled");

      // Extract image buffer
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
      const imageBuffer = await blob.arrayBuffer();

      // 5. Send to Worker for OCR
      const words = await processPageInWorker(imageBuffer, i - 1);

      // 6. Embed invisible text
      const pdfLibPage = pdfDoc.getPage(i - 1);
      const scaleFactor = 72 / 144; // 2.0 scale (144dpi) -> 72dpi

      for (const word of words) {
        if (!word.text.trim()) continue;
        const { x0, y0, x1, y1 } = word.bbox;
        
        const width = (x1 - x0) * scaleFactor;
        const height = (y1 - y0) * scaleFactor;
        const x = x0 * scaleFactor;
        const pdfPageHeight = pdfLibPage.getHeight();
        const y = pdfPageHeight - (y1 * scaleFactor);
        const fontSize = Math.max(height * 0.8, 4);

        pdfLibPage.drawText(word.text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
          opacity: 0, // Truly invisible (Rendering Mode 3)
        });
      }
    }
  } finally {
    worker.terminate();
  }

  onProgress({
    stage: "generating",
    currentPage: totalPages,
    totalPages,
    message: "Saving final PDF...",
    percent: 99,
  });

  const finalBytes = await pdfDoc.save();
  return new Blob([finalBytes as unknown as BlobPart], { type: "application/pdf" });
}
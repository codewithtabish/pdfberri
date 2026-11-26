import type * as PdfJs from "pdfjs-dist";

let pdfjsPromise: Promise<typeof PdfJs> | null = null;

/** Lazy-loads pdf.js in the browser only. Swap for your existing loader if you prefer. */
export function loadPdfJs(): Promise<typeof PdfJs> {
  pdfjsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    return pdfjs;
  });
  return pdfjsPromise;
}

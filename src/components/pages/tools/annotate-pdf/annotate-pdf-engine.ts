// src/components/pages/tools/annotate-pdf/annotate-pdf-engine.ts
import * as pdfjsLib from "pdfjs-dist";

// v6: serve the worker from /public so there is no CDN dependency.
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export type LoadedDoc = {
  doc: pdfjsLib.PDFDocumentProxy;
  loadingTask: pdfjsLib.PDFDocumentLoadingTask;
  pageDims: { widthPt: number; heightPt: number; rotation: number }[];
  bytes: ArrayBuffer;
  name: string;
  size: number;
};

export async function loadPdf(file: File): Promise<LoadedDoc> {
  const bytes = await file.arrayBuffer();
  // Keep our own copy; pdf.js may detach its input buffer.
  const forPdfJs = bytes.slice(0);

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(forPdfJs),
    useSystemFonts: true,
  });

  let doc: pdfjsLib.PDFDocumentProxy;
  try {
    doc = await loadingTask.promise;
  } catch (err: unknown) {
    // Real cause is logged once. The workspace maps the code below to a
    // user-facing message.
    console.error("[Annotate PDF] pdf.js failed to load document:", err);

    const name = (err as { name?: string } | null)?.name ?? "";
    if (name === "PasswordException") throw new Error("PASSWORD_PROTECTED");
    if (name === "InvalidPDFException") throw new Error("INVALID_PDF");
    if (name === "MissingPDFException") throw new Error("MISSING_PDF");
    throw new Error("LOAD_FAILED");
  }

  const pageDims: LoadedDoc["pageDims"] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const vp = page.getViewport({ scale: 1, rotation: page.rotate });
    pageDims.push({
      widthPt: vp.width,
      heightPt: vp.height,
      rotation: page.rotate,
    });
    page.cleanup();
  }

  return {
    doc,
    loadingTask,
    pageDims,
    bytes,
    name: file.name,
    size: file.size,
  };
}

/**
 * v6: `PDFDocumentProxy.destroy()` was removed from the public API.
 * All teardown goes through the loading task.
 * Never throws.
 */
export function destroyDoc(doc: LoadedDoc | null): void {
  if (!doc) return;
  try {
    doc.loadingTask.destroy();
  } catch {
    /* ignore */
  }
}
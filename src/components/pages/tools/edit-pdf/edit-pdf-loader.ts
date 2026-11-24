/**
 * PDFBerri – Edit PDF
 * PDF.js document loading & page extraction
 */

import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { generateId } from "./edit-pdf-coordinates";
import type { EditPage, DocumentMeta, ValidationResult } from "./edit-pdf-types";
import { validateLoadedDocument } from "./edit-pdf-validation";
import { ERROR_MESSAGES } from "./edit-pdf-constants";

let pdfjsLib: typeof import("pdfjs-dist") | null = null;

/**
 * Dynamically load pdfjs-dist only when needed (client-side)
 */
async function getPdfJs() {
  if (typeof window === "undefined") {
    throw new Error("PDF.js can only be used in the browser");
  }
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
    // Worker is expected to be configured globally by the project
    // (see existing PDFBerri pdf worker setup)
  }
  return pdfjsLib;
}

/**
 * Safely release a PDFDocumentProxy.
 * pdfjs-dist versions differ: some expose destroy(), others only cleanup().
 */
function safeDestroy(pdf: PDFDocumentProxy | null | undefined) {
  if (!pdf) return;
  try {
    const anyPdf = pdf as unknown as {
      destroy?: () => void | Promise<void>;
      cleanup?: () => void;
    };
    if (typeof anyPdf.destroy === "function") {
      anyPdf.destroy();
    } else if (typeof anyPdf.cleanup === "function") {
      anyPdf.cleanup();
    }
  } catch {
    // already destroyed / cleaned up
  }
}

export interface LoadedDocument {
  pdf: PDFDocumentProxy;
  meta: DocumentMeta;
  pages: EditPage[];
  validation: ValidationResult;
}

/**
 * Load a PDF from ArrayBuffer and build the initial page model
 */
export async function loadPdfDocument(
  bytes: ArrayBuffer,
  fileName: string,
  fileSize: number
): Promise<LoadedDocument> {
  const pdfjs = await getPdfJs();

  let pdf: PDFDocumentProxy;
  try {
    const loadingTask = pdfjs.getDocument({
      data: bytes.slice(0), // copy so original stays intact
      useSystemFonts: true,
      disableAutoFetch: false,
      disableStream: false,
    });
    pdf = await loadingTask.promise;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (/password|encrypted/i.test(message)) {
      return {
        pdf: null as unknown as PDFDocumentProxy,
        meta: {
          id: generateId("doc"),
          fileName,
          fileSize,
          pageCount: 0,
          isEncrypted: true,
          isCorrupted: false,
          originalBytes: bytes,
        },
        pages: [],
        validation: {
          valid: false,
          error: ERROR_MESSAGES.ENCRYPTED_PDF,
          isEncrypted: true,
        },
      };
    }
    throw new Error(ERROR_MESSAGES.LOAD_FAILED);
  }

  const validation = validateLoadedDocument(pdf.numPages, false);
  if (!validation.valid) {
    safeDestroy(pdf);
    return {
      pdf: null as unknown as PDFDocumentProxy,
      meta: {
        id: generateId("doc"),
        fileName,
        fileSize,
        pageCount: pdf.numPages,
        isEncrypted: false,
        isCorrupted: true,
        originalBytes: bytes,
      },
      pages: [],
      validation,
    };
  }

  const pages: EditPage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const pageId = generateId("page");

    pages.push({
      id: pageId,
      originalIndex: i - 1,
      order: i - 1,
      rotation: 0,
      dimensions: {
        width: viewport.width,
        height: viewport.height,
      },
      objects: [],
      renderStatus: "idle",
    });

    // Release page resources early
    try {
      page.cleanup();
    } catch {
      // ignore
    }
  }

  const meta: DocumentMeta = {
    id: generateId("doc"),
    fileName,
    fileSize,
    pageCount: pdf.numPages,
    isEncrypted: false,
    isCorrupted: false,
    originalBytes: bytes,
  };

  return { pdf, meta, pages, validation };
}

/**
 * Get a single PDFPageProxy (caller must cleanup)
 */
export async function getPage(
  pdf: PDFDocumentProxy,
  pageNumber: number // 1-based
): Promise<PDFPageProxy> {
  return pdf.getPage(pageNumber);
}

/**
 * Destroy the PDFDocumentProxy and free resources
 */
export function destroyDocument(pdf: PDFDocumentProxy | null) {
  safeDestroy(pdf);
}
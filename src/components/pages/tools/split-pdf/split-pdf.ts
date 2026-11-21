// Browser-side engine. Everything here runs locally: no network calls.
import type { PDFDocumentProxy } from "pdfjs-dist";
import type {
  SplitOutput,
  SplitOutputPlan,
  SplitProgress,
  SplitWorkerRequest,
  SplitWorkerResponse,
} from "./split-types";
import { SplitError } from "./split-utils";

/** Loads PDF.js on demand so it never lands in the initial page bundle. */
async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    // If your Merge PDF engine already configures this, reuse that helper instead.
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }
  return pdfjs;
}

export async function openPdfForPreview(file: File): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfJs();
  // PDF.js transfers (detaches) this buffer, so the source File is re-read at split time.
  const data = new Uint8Array(await file.arrayBuffer());
  try {
    return await pdfjs.getDocument({ data }).promise;
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name === "PasswordException") {
      throw new SplitError(
        "encrypted",
        "This PDF is password-protected, so it can't be split here. Remove the protection first if you're authorized to, then try again.",
      );
    }
    throw new SplitError("invalid-pdf", "We couldn't read this PDF. It may be damaged or in an unsupported format.");
  }
}

/** Releases the PDF.js document and its worker resources. */
export function destroyPdf(pdf: PDFDocumentProxy | null): void {
  if (pdf) void pdf.loadingTask.destroy();
}

export async function renderThumbnail(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  width: number,
  signal: AbortSignal,
): Promise<void> {
  const page = await pdf.getPage(pageNumber);
  try {
    if (signal.aborted) return;
    const base = page.getViewport({ scale: 1 });
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const viewport = page.getViewport({ scale: (width * ratio) / base.width });
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    const task = page.render({ canvas, viewport });
    const abort = () => task.cancel();
    signal.addEventListener("abort", abort, { once: true });
    try {
      await task.promise;
    } finally {
      signal.removeEventListener("abort", abort);
    }
  } finally {
    page.cleanup();
  }
}

export interface SplitJob {
  promise: Promise<SplitOutput[]>;
  cancel: () => void;
}

/** Runs the split in a Web Worker. Cancelling terminates the worker. */
export function runSplit(
  buffer: ArrayBuffer,
  plans: readonly SplitOutputPlan[],
  onProgress: (progress: SplitProgress) => void,
): SplitJob {
  const worker = new Worker(new URL("./split-worker.ts", import.meta.url), { type: "module" });
  const byId = new Map(plans.map((plan) => [plan.id, plan]));
  const results: SplitOutput[] = [];
  let settle: { resolve: (v: SplitOutput[]) => void; reject: (e: unknown) => void } | null = null;

  const finish = () => {
    worker.terminate();
    settle = null;
  };

  const promise = new Promise<SplitOutput[]>((resolve, reject) => {
    settle = { resolve, reject };

    worker.onmessage = (event: MessageEvent<SplitWorkerResponse>) => {
      const message = event.data;
      switch (message.type) {
        case "progress":
          onProgress({ stage: message.stage, completed: message.completed, total: message.total });
          break;
        case "output": {
          const plan = byId.get(message.id);
          if (!plan) break;
          const blob = new Blob([message.bytes], { type: "application/pdf" });
          results.push({
            id: plan.id,
            filename: plan.filename,
            label: plan.label,
            pageCount: plan.pageCount,
            size: blob.size,
            blob,
          });
          break;
        }
        case "done": {
          const s = settle;
          finish();
          s?.resolve(results);
          break;
        }
        case "failed": {
          const s = settle;
          finish();
          s?.reject(new SplitError(message.code, message.message));
          break;
        }
      }
    };

    worker.onerror = () => {
      const s = settle;
      finish();
      s?.reject(new SplitError("processing-failed", "Splitting stopped unexpectedly. Please try again."));
    };

    const request: SplitWorkerRequest = {
      type: "start",
      buffer,
      outputs: plans.map(({ id, filename, pageIndices }) => ({ id, filename, pageIndices })),
    };
    worker.postMessage(request, [buffer]);
  });

  return {
    promise,
    cancel: () => {
      const s = settle;
      finish();
      s?.reject(new SplitError("cancelled", "Splitting was cancelled."));
    },
  };
}

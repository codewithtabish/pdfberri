// src/components/pages/tools/unlock-pdf/unlock-pdf.engine.ts

import { PDFDocument } from "pdf-lib";
import type {
  UnlockEngineInput,
  UnlockEngineResult,
  UnlockErrorCode,
} from "./unlock-pdf.types";

// ?v= busts the browser cache so the updated worker is always loaded.
const WORKER_URL = "/vendor/qpdf/unlock-qpdf-worker.js?v=2";
const WORKER_TIMEOUT_MS = 120_000;

interface WorkerSuccess {
  id: number;
  ok: true;
  bytes: ArrayBuffer;
}

interface WorkerFailure {
  id: number;
  ok: false;
  code: string;
  message: string;
}

type WorkerResponse = WorkerSuccess | WorkerFailure;

class UnlockWorkerError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function runWorker(buffer: ArrayBuffer, password: string): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(WORKER_URL);
    } catch {
      reject(new UnlockWorkerError("engine-init-failed", "Worker could not start."));
      return;
    }

    const requestId = 1;
    let settled = false;

    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      action();
    };

    const timer = setTimeout(() => {
      finish(() => reject(new UnlockWorkerError("processing-failed", "Processing timed out.")));
    }, WORKER_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const data = event.data;
      if (!data || data.id !== requestId) return;
      if (data.ok) {
        finish(() => resolve(data.bytes));
      } else {
        finish(() => reject(new UnlockWorkerError(data.code, data.message)));
      }
    };

    worker.onerror = () => {
      finish(() =>
        reject(new UnlockWorkerError("engine-init-failed", "Worker failed to load."))
      );
    };

    // Transfer the buffer (no copy). The caller creates a fresh buffer per run.
    worker.postMessage({ id: requestId, bytes: buffer, password }, [buffer]);
  });
}

function mapError(err: unknown): UnlockErrorCode {
  const code = err instanceof UnlockWorkerError ? err.code : "";
  switch (code) {
    case "invalid-password":
      return "incorrect-password";
    case "already-unlocked":
      return "already-unlocked";
    case "engine-init-failed":
      return "engine-init-failed";
    case "unsupported-encryption":
      return "unsupported-encryption";
    default:
      return "processing-failed";
  }
}

// A real PDF starts with "%PDF-" and ends with "%%EOF". pdf-lib is lenient and
// will happily load truncated files, so we check the structure ourselves.
function isCompletePdf(bytes: ArrayBuffer): boolean {
  const view = new Uint8Array(bytes);
  if (view.length < 16) return false;

  const head = new TextDecoder("latin1").decode(view.subarray(0, 5));
  if (head !== "%PDF-") return false;

  const tail = new TextDecoder("latin1").decode(
    view.subarray(Math.max(0, view.length - 1024))
  );
  return tail.includes("%%EOF");
}

export async function decryptPDF(input: UnlockEngineInput): Promise<UnlockEngineResult> {
  try {
    const bytes = await runWorker(input.fileBuffer, input.password);

    if (bytes.byteLength === 0 || !isCompletePdf(bytes)) {
      return { success: false, error: "processing-failed" };
    }

    // Verify: pdf-lib refuses encrypted files by default, so a successful load
    // proves the output opens without the password.
    let pageCount: number;
    try {
      const verifyDoc = await PDFDocument.load(bytes);
      pageCount = verifyDoc.getPageCount();
    } catch {
      return { success: false, error: "processing-failed" };
    }

    if (pageCount === 0) {
      return { success: false, error: "processing-failed" };
    }

    const blob = new Blob([bytes], { type: "application/pdf" });
    return { success: true, output: { blob, pageCount } };
  } catch (err: unknown) {
    const code = mapError(err);
    // Strings only: never log the password or raw objects.
    if (code !== "incorrect-password" && code !== "already-unlocked") {
      const detail = err instanceof Error ? err.message : "unknown";
      console.warn(`[Unlock PDF] ${code}: ${detail}`);
    }
    return { success: false, error: code };
  }
}
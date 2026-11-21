import type { CompressWorkerRequest, CompressWorkerResponse } from "./compress-types";
import { CompressError } from "./compress-utils";
import type { EngineCompressInput, EngineCompressOutput, PdfCompressionEngine } from "./compress-engine";
import { resolveSettings } from "./compress-planner";

function createWorker(): Worker {
  return new Worker(new URL("./compress-worker.ts", import.meta.url), { type: "module" });
}

export const localEngine: PdfCompressionEngine = {
  id: "local",
  label: "Process in your browser",
  supportedModes: ["recommended", "high", "maximum-quality", "custom"],
  losslessOnly: true,
  async compress({ file, mode, settings, onProgress, signal }): Promise<EngineCompressOutput> {
    const buffer = await file.arrayBuffer();
    const worker = createWorker();
    const resolved = resolveSettings(mode, settings);

    return new Promise<EngineCompressOutput>((resolve, reject) => {
      let settled = false;

      const cleanup = () => {
        if (settled) return;
        settled = true;
        worker.terminate();
        signal?.removeEventListener("abort", onAbort);
      };

      const onAbort = () => {
        if (settled) return;
        cleanup();
        reject(new CompressError("cancelled", "Compression was cancelled."));
      };
      signal?.addEventListener("abort", onAbort, { once: true });

      worker.onmessage = (event: MessageEvent<CompressWorkerResponse>) => {
        const message = event.data;
        if (message.type === "progress") {
          onProgress({ stage: message.stage, completed: message.completed, total: message.total });
        } else if (message.type === "done") {
          cleanup();
          resolve({ bytes: message.bytes, pageCount: message.pageCount });
        } else if (message.type === "failed") {
          cleanup();
          reject(new CompressError(message.code, message.message));
        }
      };

      worker.onerror = () => {
        cleanup();
        reject(new CompressError("worker", "The compression engine couldn't start in this browser."));
      };

      const request: CompressWorkerRequest = {
        type: "compress",
        buffer,
        filename: file.name,
        settings: resolved,
        mode,
      };
      worker.postMessage(request, [buffer]);
    });
  },
};
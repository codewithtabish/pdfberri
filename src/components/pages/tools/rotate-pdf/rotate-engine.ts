import type { RotateOutput } from "./rotate-types";
import { RotateError } from "./rotate-utils";

export function processRotation(
  file: File,
  rotations: Record<number, number>, // pageIndex -> pending rotation
  onProgress: (current: number, total: number) => void
): { promise: Promise<RotateOutput>; cancel: () => void } {
  const worker = new Worker(new URL("./rotate-worker.ts", import.meta.url), { type: "module" });
  let settled = false;

  const promise = new Promise<RotateOutput>((resolve, reject) => {
    worker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === "progress") {
        onProgress(payload.current, payload.total);
      } else if (type === "done") {
        settled = true;
        worker.terminate();
        const blob = new Blob([payload.buffer], { type: "application/pdf" });
        resolve({
          blob,
          filename: file.name.replace(/\.pdf$/i, "") + "-rotated.pdf",
          size: blob.size,
          pageCount: payload.pageCount,
        });
      } else if (type === "error") {
        settled = true;
        worker.terminate();
        reject(new RotateError(payload.message));
      }
    };

    worker.onerror = () => {
      settled = true;
      worker.terminate();
      reject(new RotateError("The rotation engine failed to start."));
    };

    file.arrayBuffer().then((buffer) => {
      worker.postMessage({ buffer, rotations }, [buffer]);
    }).catch((err) => {
      settled = true;
      worker.terminate();
      reject(new RotateError("Failed to read the PDF file."));
    });
  });

  return {
    promise,
    cancel: () => {
      if (settled) return;
      settled = true;
      worker.terminate();
      // Note: Promise won't resolve/reject here to avoid unhandled rejections, 
      // the caller should handle state reset via UI.
    },
  };
}
import type {
  MergeErrorCode,
  MergeProgress,
  WorkItem,
  WorkerRequest,
  WorkerResponse,
} from "./merge-types";

export class MergeFailure extends Error {
  readonly code: MergeErrorCode;
  readonly fileId?: string;

  constructor(code: MergeErrorCode, fileId?: string) {
    super(code);
    this.name = "MergeFailure";
    this.code = code;
    this.fileId = fileId;
  }
}

export type InspectResult =
  | { id: string; ok: true; pageCount: number }
  | { id: string; ok: false; code: MergeErrorCode };

export interface InspectHandle {
  promise: Promise<void>;
  terminate: () => void;
}

export interface MergeOutput {
  buffer: ArrayBuffer;
  pageCount: number;
}

export interface MergeHandle {
  promise: Promise<MergeOutput>;
  cancel: () => void;
}

// The worker (and pdf-lib) is only downloaded when this runs, never on the homepage.
function createMergeWorker(): Worker {
  return new Worker(new URL("./merge-worker.ts", import.meta.url), {
    type: "module",
  });
}

/** Reads page counts and detects unreadable/encrypted files, off the main thread. */
export function inspectFiles(
  items: WorkItem[],
  onResult: (result: InspectResult) => void,
): InspectHandle {
  let worker: Worker | null = null;
  let finished = false;
  let finish: () => void = () => {};
  const pending = new Set(items.map((item) => item.id));

  const promise = new Promise<void>((resolve) => {
    finish = () => {
      if (finished) return;
      finished = true;
      worker?.terminate();
      worker = null;
      resolve();
    };
  });

  const failAll = (code: MergeErrorCode) => {
    pending.forEach((id) => onResult({ id, ok: false, code }));
    pending.clear();
    finish();
  };

  try {
    worker = createMergeWorker();
  } catch {
    failAll("worker");
    return { promise, terminate: finish };
  }

  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const message = event.data;
    if (message.type === "inspected") {
      pending.delete(message.id);
      onResult({ id: message.id, ok: true, pageCount: message.pageCount });
    } else if (message.type === "inspect-failed") {
      pending.delete(message.id);
      onResult({ id: message.id, ok: false, code: message.code });
    }
    if (pending.size === 0) finish();
  };

  worker.onerror = () => failAll("worker");

  const request: WorkerRequest = { type: "inspect", items };
  worker.postMessage(request);

  return { promise, terminate: finish };
}

/** Merges the files in the exact order given. Cancel terminates the worker. */
export function mergeFiles(
  items: WorkItem[],
  onProgress: (progress: MergeProgress) => void,
): MergeHandle {
  let worker: Worker | null = null;
  let settled = false;
  let rejectPromise: (reason: MergeFailure) => void = () => {};

  const cleanup = () => {
    worker?.terminate();
    worker = null;
  };

  const promise = new Promise<MergeOutput>((resolve, reject) => {
    rejectPromise = reject;

    try {
      worker = createMergeWorker();
    } catch {
      settled = true;
      reject(new MergeFailure("worker"));
      return;
    }

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.type === "progress") {
        onProgress({
          stage: message.stage,
          completed: message.completed,
          total: message.total,
        });
      } else if (message.type === "merged") {
        settled = true;
        cleanup();
        resolve({ buffer: message.buffer, pageCount: message.pageCount });
      } else if (message.type === "merge-failed") {
        settled = true;
        cleanup();
        reject(new MergeFailure(message.code, message.fileId));
      }
    };

    worker.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new MergeFailure("worker"));
    };

    const request: WorkerRequest = { type: "merge", items };
    worker.postMessage(request);
  });

  const cancel = () => {
    if (settled) return;
    settled = true;
    cleanup();
    rejectPromise(new MergeFailure("cancelled"));
  };

  return { promise, cancel };
}
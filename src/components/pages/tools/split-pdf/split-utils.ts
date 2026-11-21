import type { PageRangeInput, SplitErrorCode } from "./split-types";

export class SplitError extends Error {
  readonly code: SplitErrorCode;
  constructor(code: SplitErrorCode, message: string) {
    super(message);
    this.name = "SplitError";
    this.code = code;
  }
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof SplitError) return error.message;
  return "Something went wrong while processing your PDF. Please try again.";
}

let idCounter = 0;
export function createId(prefix = "id"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 10 || unit === 0 ? value.toFixed(unit === 0 ? 0 : 1) : value.toFixed(1)} ${units[unit]}`;
}

/**
 * Formats ZERO-based indices as a one-based, human-readable list.
 * [0,1,2,3,4] -> "1–5", [1,3,6] -> "2, 4, 7", [0,1,2,5] -> "1–3, 6"
 */
export function formatPageList(indices: readonly number[]): string {
  if (indices.length === 0) return "";
  const parts: string[] = [];
  let start = indices[0];
  let prev = indices[0];
  for (let i = 1; i <= indices.length; i += 1) {
    const current = indices[i];
    if (current === prev + 1) {
      prev = current;
      continue;
    }
    parts.push(start === prev ? `${start + 1}` : `${start + 1}–${prev + 1}`);
    start = current;
    prev = current;
  }
  return parts.join(", ");
}

export function pagesLabel(indices: readonly number[]): string {
  return `${indices.length === 1 ? "Page" : "Pages"} ${formatPageList(indices)}`;
}

export function defaultRanges(pageCount: number): PageRangeInput[] {
  if (pageCount < 2) return [{ id: createId("range"), start: "1", end: String(pageCount) }];
  const mid = Math.ceil(pageCount / 2);
  return [
    { id: createId("range"), start: "1", end: String(mid) },
    { id: createId("range"), start: String(mid + 1), end: String(pageCount) },
  ];
}

type QueueEntry = { start: () => void; reject: (reason: unknown) => void };

/** Limits concurrent thumbnail renders and allows cancelling queued or running jobs. */
export class RenderQueue {
  private active = 0;
  private waiting: QueueEntry[] = [];

  constructor(private readonly limit: number) {}

  enqueue(task: (signal: AbortSignal) => Promise<void>) {
    const controller = new AbortController();
    let entry: QueueEntry | undefined;

    const promise = new Promise<void>((resolve, reject) => {
      entry = {
        reject,
        start: () => {
          this.active += 1;
          task(controller.signal)
            .then(resolve, reject)
            .finally(() => {
              this.active -= 1;
              this.drain();
            });
        },
      };
    });

    const queued = entry as QueueEntry;
    this.waiting.push(queued);
    this.drain();

    return {
      promise,
      signal: controller.signal,
      cancel: () => {
        controller.abort();
        const index = this.waiting.indexOf(queued);
        if (index >= 0) {
          this.waiting.splice(index, 1);
          queued.reject(new DOMException("Cancelled", "AbortError"));
        }
      },
    };
  }

  private drain() {
    while (this.active < this.limit && this.waiting.length > 0) {
      this.waiting.shift()?.start();
    }
  }
}

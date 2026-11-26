export type ErrorCode =
  | "unsupported-type"
  | "empty-file"
  | "file-too-large"
  | "invalid-file"
  | "corrupt"
  | "encrypted"
  | "too-many-slides"
  | "archive-too-large"
  | "conversion-timeout"
  | "conversion-failed"
  | "out-of-memory"
  | "invalid-output"
  | "invalid-selection"
  | "no-slides-selected"
  | "invalid-state"
  | "not-found"
  | "worker-busy"
  | "worker-unavailable"
  | "internal";

export const HTTP_STATUS: Record<ErrorCode, number> = {
  "unsupported-type": 415,
  "empty-file": 400,
  "file-too-large": 413,
  "invalid-file": 422,
  corrupt: 422,
  encrypted: 422,
  "too-many-slides": 422,
  "archive-too-large": 422,
  "conversion-timeout": 504,
  "conversion-failed": 422,
  "out-of-memory": 507,
  "invalid-output": 500,
  "invalid-selection": 400,
  "no-slides-selected": 400,
  "invalid-state": 409,
  "not-found": 404,
  "worker-busy": 503,
  "worker-unavailable": 503,
  internal: 500,
};

export class JobError extends Error {
  constructor(readonly code: ErrorCode) {
    super(code);
    this.name = "JobError";
  }
}

/** Thrown inside the pipeline when the job was cancelled or expired; never reported as a failure. */
export class CancelledError extends Error {
  constructor() {
    super("cancelled");
    this.name = "CancelledError";
  }
}

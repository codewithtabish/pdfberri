import { API_BASE } from "./powerpoint-to-pdf-constants";
import { isPptErrorCode } from "./powerpoint-to-pdf-errors";
import type { PptErrorCode, PptFinalizeRequest, PptJobStatus } from "./powerpoint-to-pdf-types";
import { isAbortError } from "./powerpoint-to-pdf-utils";

export class PptApiError extends Error {
  constructor(
    readonly code: PptErrorCode,
    readonly status: number,
  ) {
    super(code);
    this.name = "PptApiError";
  }
}

function codeFromBody(body: unknown, status: number): PptErrorCode {
  const code = (body as { error?: { code?: unknown } } | null)?.error?.code;
  if (isPptErrorCode(code)) return code;
  if (status === 404) return "not-found";
  if (status === 429) return "rate-limited";
  if (status === 413) return "file-too-large";
  return "internal";
}

async function requestJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, cache: "no-store" });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new PptApiError("network", 0);
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new PptApiError(codeFromBody(body, response.status), response.status);
  return body as T;
}

export function uploadPresentation(
  file: File,
  options: { signal: AbortSignal; onProgress: (percent: number) => void },
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (options.signal.aborted) return reject(new DOMException("Aborted", "AbortError"));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", API_BASE);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) options.onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let body: unknown = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON response */
      }
      const id = (body as { id?: unknown } | null)?.id;
      if (xhr.status === 202 && typeof id === "string") return resolve(id);
      reject(new PptApiError(codeFromBody(body, xhr.status), xhr.status));
    };
    xhr.onerror = () => reject(new PptApiError("network", 0));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));
    options.signal.addEventListener("abort", () => xhr.abort(), { once: true });

    xhr.send(file);
  });
}

export function getJobStatus(jobId: string, signal?: AbortSignal): Promise<PptJobStatus> {
  return requestJson<PptJobStatus>(`${API_BASE}/${jobId}`, { signal });
}

export function finalizeJob(jobId: string, request: PptFinalizeRequest): Promise<PptJobStatus> {
  return requestJson<PptJobStatus>(`${API_BASE}/${jobId}/finalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

/** Cancels any running conversion and deletes the job's files. Safe to call repeatedly. */
export async function deleteJob(jobId: string): Promise<void> {
  await fetch(`${API_BASE}/${jobId}`, { method: "DELETE", keepalive: true }).catch(() => undefined);
}

export function getDownloadUrl(jobId: string): string {
  return `${API_BASE}/${jobId}/download`;
}

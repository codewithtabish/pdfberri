// src/components/pages/tools/word-to-pdf/word-to-pdf-cloud-engine.ts
//
// Server engine. Only used after the user explicitly agrees to upload the
// document. Upload progress is real (XMLHttpRequest); the conversion itself
// cannot report progress, so it is shown as indeterminate.

import {
  CLOUD_DEFAULT_TIMEOUT_MS,
  PDF_MIME,
  WORD_TO_PDF_API_ROUTE,
  WORD_TO_PDF_LIMITS,
} from "./word-to-pdf-constants";
import {
  isKnownErrorCode,
  toWordToPdfError,
  WordToPdfError,
} from "./word-to-pdf-errors";
import type {
  CloudCapabilities,
  ConversionOutput,
  ConversionRequest,
  WordToPdfEngine,
} from "./word-to-pdf-types";
import { buildPdfFileName, throwIfAborted } from "./word-to-pdf-utils";

const UNAVAILABLE: CloudCapabilities = {
  available: false,
  maxFileBytes: WORD_TO_PDF_LIMITS.maxLegacyFileBytes,
};

/** Never rejects: any failure means "server conversion is not available". */
export async function fetchCloudCapabilities(
  signal?: AbortSignal,
): Promise<CloudCapabilities> {
  try {
    const response = await fetch(WORD_TO_PDF_API_ROUTE, {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal,
    });
    if (!response.ok) return UNAVAILABLE;
    const data: unknown = await response.json();
    if (typeof data !== "object" || data === null) return UNAVAILABLE;
    const record = data as Record<string, unknown>;
    const maxFileBytes =
      typeof record.maxFileBytes === "number" && record.maxFileBytes > 0
        ? record.maxFileBytes
        : UNAVAILABLE.maxFileBytes;
    return { available: record.available === true, maxFileBytes };
  } catch {
    return UNAVAILABLE;
  }
}

interface XhrResult {
  status: number;
  blob: Blob | null;
  contentType: string;
}

function postForm(
  url: string,
  form: FormData,
  signal: AbortSignal,
  onUploadProgress: (loaded: number, total: number) => void,
  onUploadComplete: () => void,
): Promise<XhrResult> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new WordToPdfError("CANCELLED"));
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "blob";
    xhr.timeout = CLOUD_DEFAULT_TIMEOUT_MS;

    const onAbort = () => xhr.abort();
    signal.addEventListener("abort", onAbort, { once: true });
    const cleanup = () => signal.removeEventListener("abort", onAbort);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onUploadProgress(event.loaded, event.total);
    };
    xhr.upload.onload = () => onUploadComplete();
    xhr.onload = () => {
      cleanup();
      resolve({
        status: xhr.status,
        blob: xhr.response instanceof Blob ? xhr.response : null,
        contentType: xhr.getResponseHeader("Content-Type") ?? "",
      });
    };
    xhr.onerror = () => {
      cleanup();
      reject(new WordToPdfError("NETWORK"));
    };
    xhr.ontimeout = () => {
      cleanup();
      reject(new WordToPdfError("TIMEOUT"));
    };
    xhr.onabort = () => {
      cleanup();
      reject(new WordToPdfError("CANCELLED"));
    };
    xhr.send(form);
  });
}

async function errorFromResponse(result: XhrResult): Promise<WordToPdfError> {
  if (result.blob) {
    try {
      const parsed: unknown = JSON.parse(await result.blob.text());
      const code =
        typeof parsed === "object" && parsed !== null
          ? (parsed as { error?: { code?: unknown } }).error?.code
          : undefined;
      if (isKnownErrorCode(code)) return new WordToPdfError(code);
    } catch {
      // fall through to status mapping
    }
  }
  switch (result.status) {
    case 413:
      return new WordToPdfError("FILE_TOO_LARGE");
    case 429:
      return new WordToPdfError("RATE_LIMITED");
    case 503:
      return new WordToPdfError("SERVER_BUSY");
    case 408:
    case 504:
      return new WordToPdfError("TIMEOUT");
    case 403:
      return new WordToPdfError("FORBIDDEN");
    default:
      return new WordToPdfError("UNKNOWN");
  }
}

async function convertOnServer(request: ConversionRequest): Promise<ConversionOutput> {
  const { file, signal, onProgress } = request;
  throwIfAborted(signal);

  const form = new FormData();
  form.append("consent", "true");
  form.append("file", file.file, file.safeName);

  onProgress?.({
    phase: "uploading",
    message: "Uploading your document…",
    completed: 0,
    total: file.sizeBytes,
  });

  const result = await postForm(
    WORD_TO_PDF_API_ROUTE,
    form,
    signal,
    (loaded, total) =>
      onProgress?.({
        phase: "uploading",
        message: "Uploading your document…",
        completed: loaded,
        total,
      }),
    () =>
      onProgress?.({
        phase: "converting",
        message: "Converting on the server…",
      }),
  );

  if (
    result.status !== 200 ||
    !result.blob ||
    !result.contentType.toLowerCase().includes(PDF_MIME)
  ) {
    throw await errorFromResponse(result);
  }

  return {
    blob: result.blob,
    fileName: buildPdfFileName(file.file.name),
    sizeBytes: result.blob.size,
    pageCount: null,
    engine: "cloud",
  };
}

export const cloudWordToPdfEngine: WordToPdfEngine = {
  id: "cloud",
  label: "On the PDFBerri server",
  supportedFormats: ["docx", "doc"],
  supportedSettings: [],
  processesLocally: false,

  async isAvailable() {
    return (await fetchCloudCapabilities()).available;
  },

  async convert(request) {
    try {
      return await convertOnServer(request);
    } catch (error) {
      throw toWordToPdfError(error);
    }
  },
};

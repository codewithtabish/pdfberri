import { MERGE_LIMITS } from "./merge-constants";
import type { MergeErrorCode } from "./merge-types";
import { describeMergeError } from "./merge-utils";

export interface RejectedFile {
  fileName: string;
  code: MergeErrorCode;
  message: string;
}

export interface ScreenResult {
  accepted: File[];
  rejected: RejectedFile[];
}

const PDF_MIME_TYPE = "application/pdf";
const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"

function looksLikePdfByName(file: File): boolean {
  return (
    file.type === PDF_MIME_TYPE || file.name.toLowerCase().endsWith(".pdf")
  );
}

/** Checks the file's real content, not just its extension or MIME type. */
async function hasPdfSignature(file: File): Promise<boolean> {
  try {
    const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
    for (let i = 0; i <= head.length - PDF_SIGNATURE.length; i++) {
      if (PDF_SIGNATURE.every((byte, j) => head[i + j] === byte)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Fast local checks before any heavy processing.
 * Every rejected file is reported, never silently ignored.
 */
export async function screenIncomingFiles(
  incoming: File[],
  existing: { count: number; totalSize: number },
): Promise<ScreenResult> {
  const accepted: File[] = [];
  const rejected: RejectedFile[] = [];
  let count = existing.count;
  let totalSize = existing.totalSize;

  const reject = (file: File, code: MergeErrorCode) =>
    rejected.push({
      fileName: file.name,
      code,
      message: describeMergeError(code),
    });

  for (const file of incoming) {
    if (!looksLikePdfByName(file)) {
      reject(file, "not-pdf");
      continue;
    }
    if (file.size === 0) {
      reject(file, "empty");
      continue;
    }
    if (file.size > MERGE_LIMITS.maxFileSizeBytes) {
      reject(file, "too-large");
      continue;
    }
    if (count >= MERGE_LIMITS.maxFiles) {
      reject(file, "too-many-files");
      continue;
    }
    if (totalSize + file.size > MERGE_LIMITS.maxTotalSizeBytes) {
      reject(file, "total-too-large");
      continue;
    }
    if (!(await hasPdfSignature(file))) {
      reject(file, "not-pdf");
      continue;
    }

    accepted.push(file);
    count += 1;
    totalSize += file.size;
  }

  return { accepted, rejected };
}
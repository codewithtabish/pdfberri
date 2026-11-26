import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

function int(key: string, fallback: number): number {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/** Finds LibreOffice: SOFFICE_BIN first, then the usual Windows/macOS install paths, then PATH. */
function findSoffice(): string {
  if (process.env.SOFFICE_BIN) return process.env.SOFFICE_BIN;
  const candidates =
    process.platform === "win32"
      ? [
          "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
          "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
        ]
      : process.platform === "darwin"
        ? ["/Applications/LibreOffice.app/Contents/MacOS/soffice"]
        : [];
  return candidates.find((candidate) => existsSync(candidate)) ?? "soffice";
}

// Mutable on purpose so tests can point workDir elsewhere.
export const config = {
  port: int("PORT", 8080),
  secret: process.env.WORKER_SECRET ?? "",
  workDir: process.env.WORK_DIR ?? path.join(os.tmpdir(), "pdfberri-ppt-jobs"),
  sofficeBin: findSoffice(),
  maxUploadBytes: int("MAX_UPLOAD_BYTES", 100 * 1024 * 1024),
  maxOutputBytes: int("MAX_OUTPUT_BYTES", 300 * 1024 * 1024),
  maxSlides: int("MAX_SLIDES", 500),
  maxZipEntries: int("MAX_ZIP_ENTRIES", 5000),
  maxUncompressedBytes: int("MAX_UNCOMPRESSED_BYTES", 1024 * 1024 * 1024),
  maxExpansionRatio: int("MAX_EXPANSION_RATIO", 200),
  convertTimeoutMs: int("CONVERT_TIMEOUT_MS", 180_000),
  concurrency: int("CONCURRENCY", 2),
  maxWaiting: int("MAX_WAITING", 20),
  maxJobs: int("MAX_JOBS", 60),
  retentionMs: int("RETENTION_MINUTES", 30) * 60_000,
};

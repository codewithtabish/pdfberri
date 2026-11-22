// src/lib/word-to-pdf/word-to-pdf-server.ts
//
// Server-only helpers for the optional LibreOffice conversion tier.
// Do not import this file from client components.

import { spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { WordToPdfError } from "@/components/pages/tools/word-to-pdf/word-to-pdf-errors";
import type {
  WordFormat,
  WordToPdfErrorCode,
} from "@/components/pages/tools/word-to-pdf/word-to-pdf-types";

const MB = 1024 * 1024;

export interface ServerConfig {
  enabled: boolean;
  binaryPath: string;
  maxFileBytes: number;
  timeoutMs: number;
  maxConcurrent: number;
  rateLimitPerMinute: number;
}

function readInt(value: string | undefined, fallback: number, min: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= min ? parsed : fallback;
}

export function readServerConfig(
  env: Record<string, string | undefined> = process.env,
): ServerConfig {
  return {
    enabled: env.WORD_TO_PDF_SERVER_ENABLED === "true",
    binaryPath: env.LIBREOFFICE_PATH?.trim() || "soffice",
    maxFileBytes: readInt(env.WORD_TO_PDF_MAX_MB, 25, 1) * MB,
    timeoutMs: readInt(env.WORD_TO_PDF_TIMEOUT_MS, 60_000, 1_000),
    maxConcurrent: readInt(env.WORD_TO_PDF_MAX_CONCURRENT, 2, 1),
    rateLimitPerMinute: readInt(env.WORD_TO_PDF_RATE_LIMIT_PER_MIN, 6, 1),
  };
}

/* ------------------------------ rate limiting ----------------------------- */

export class SlidingWindowRateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  /** Returns true if the request is allowed. */
  consume(key: string, now: number = Date.now()): boolean {
    const cutoff = now - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((time) => time > cutoff);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);

    if (this.hits.size > 5_000) {
      for (const [storedKey, times] of this.hits) {
        if (times.every((time) => time <= cutoff)) this.hits.delete(storedKey);
      }
    }
    return true;
  }
}

let sharedLimiter: SlidingWindowRateLimiter | null = null;
let sharedLimiterLimit = 0;

/** Per-process limiter. Use a shared store (e.g. Redis) when running several instances. */
export function getRateLimiter(limitPerMinute: number): SlidingWindowRateLimiter {
  if (!sharedLimiter || sharedLimiterLimit !== limitPerMinute) {
    sharedLimiter = new SlidingWindowRateLimiter(limitPerMinute, 60_000);
    sharedLimiterLimit = limitPerMinute;
  }
  return sharedLimiter;
}

/* ------------------------------- concurrency ------------------------------ */

let activeJobs = 0;

/** Returns a release function, or null when the server is at capacity. */
export function acquireJobSlot(maxConcurrent: number): (() => void) | null {
  if (activeJobs >= maxConcurrent) return null;
  activeJobs += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeJobs = Math.max(0, activeJobs - 1);
  };
}

/* ---------------------------- request protection --------------------------- */

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}

/**
 * Minimal CSRF / drive-by protection: browsers always send Origin on POST, and
 * it must match the host that served the page.
 *
 * PLUG YOUR AUTH HERE: if PDFBerri requires sign-in for server conversion,
 * check the session in the route handler before calling this function.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const ERROR_STATUS: Partial<Record<WordToPdfErrorCode, number>> = {
  ENGINE_UNAVAILABLE: 503,
  FORBIDDEN: 403,
  RATE_LIMITED: 429,
  SERVER_BUSY: 503,
  FILE_TOO_LARGE: 413,
  CONSENT_REQUIRED: 400,
  UNSUPPORTED_TYPE: 415,
  EMPTY_FILE: 400,
  EXTENSION_MISMATCH: 400,
  CORRUPT_DOCUMENT: 422,
  PASSWORD_PROTECTED_OR_LEGACY: 422,
  UNSAFE_ARCHIVE: 422,
  RENDER_FAILED: 422,
  TIMEOUT: 504,
  INVALID_OUTPUT: 502,
};

export function statusForCode(code: WordToPdfErrorCode): number {
  return ERROR_STATUS[code] ?? 500;
}

/* ------------------------------ LibreOffice ------------------------------- */

export function buildLibreOfficeArgs(
  profileDir: string,
  outputDir: string,
  inputPath: string,
): string[] {
  return [
    "--headless",
    "--norestore",
    "--nolockcheck",
    "--nodefault",
    "--nofirststartwizard",
    "--nologo",
    `-env:UserInstallation=${pathToFileURL(profileDir).href}`,
    "--convert-to",
    "pdf:writer_pdf_Export",
    "--outdir",
    outputDir,
    inputPath,
  ];
}

function killTree(child: ChildProcess): void {
  const pid = child.pid;
  if (!pid) return;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true,
      });
    } else {
      process.kill(-pid, "SIGKILL");
    }
  } catch {
    try {
      child.kill("SIGKILL");
    } catch {
      // already gone
    }
  }
}

function minimalEnv(workDir: string): NodeJS.ProcessEnv {
  const env = {
    PATH: process.env.PATH,
    HOME: workDir,
    TMPDIR: workDir,
    TEMP: workDir,
    TMP: workDir,
    LANG: "C.UTF-8",
  };
  const withRoot: Record<string, string | undefined> = process.env.SystemRoot
    ? { ...env, SystemRoot: process.env.SystemRoot }
    : env;
  // Deliberately minimal: no secrets or app environment reach LibreOffice.
  return withRoot as NodeJS.ProcessEnv;
}

export interface LibreOfficeJob {
  input: Uint8Array;
  format: WordFormat;
  config: ServerConfig;
  signal?: AbortSignal;
}

/**
 * Converts in a throw-away directory with its own LibreOffice profile.
 * The directory (source and output) is always deleted, success or failure.
 */
export async function convertWithLibreOffice(job: LibreOfficeJob): Promise<Uint8Array> {
  const workDir = await mkdtemp(join(tmpdir(), "pdfberri-w2p-"));
  try {
    const inputPath = join(workDir, `input.${job.format}`);
    const outputDir = join(workDir, "out");
    const profileDir = join(workDir, "profile");
    await writeFile(inputPath, job.input, { mode: 0o600 });

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (error?: WordToPdfError) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        job.signal?.removeEventListener("abort", onAbort);
        if (error) reject(error);
        else resolve();
      };

      const child = spawn(
        job.config.binaryPath,
        buildLibreOfficeArgs(profileDir, outputDir, inputPath),
        {
          cwd: workDir,
          env: minimalEnv(workDir),
          stdio: "ignore",
          detached: process.platform !== "win32",
          windowsHide: true,
        },
      );

      const timer = setTimeout(() => {
        killTree(child);
        finish(new WordToPdfError("TIMEOUT"));
      }, job.config.timeoutMs);

      const onAbort = () => {
        killTree(child);
        finish(new WordToPdfError("CANCELLED"));
      };
      job.signal?.addEventListener("abort", onAbort, { once: true });

      child.once("error", () => finish(new WordToPdfError("ENGINE_UNAVAILABLE")));
      child.once("close", (code) => {
        if (code === 0) finish();
        else finish(new WordToPdfError("RENDER_FAILED"));
      });
    });

    try {
      return new Uint8Array(await readFile(join(outputDir, "input.pdf")));
    } catch {
      throw new WordToPdfError("RENDER_FAILED");
    }
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

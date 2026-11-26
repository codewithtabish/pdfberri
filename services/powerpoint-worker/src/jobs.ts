import { randomBytes } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { Transform, type Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { config } from "./config.js";
import { CancelledError, JobError, type ErrorCode } from "./errors.js";
import { inspectPptx, isEncryptedOoxml, sniffContainer } from "./inspect.js";
import { assertTransition, canTransition, isTerminal, type JobState } from "./job-state.js";
import { buildOutput, verifyPdf, type Orientation, type PageSize } from "./output.js";
import { convertToPdf } from "./soffice.js";

export interface FinalizeRequest {
  slides: number[] | null;
  pageSize: PageSize;
  orientation: Orientation;
  includeHidden: boolean;
}

export interface Job {
  id: string;
  state: JobState;
  dir: string;
  sourceName: string;
  sourceFormat: "ppt" | "pptx" | null;
  expiresAt: number;
  slideCount: number | null;
  hiddenSlides: number[] | null;
  slideSize: { widthPt: number; heightPt: number } | null;
  errorCode: ErrorCode | null;
  masterPath: string | null;
  outputPath: string | null;
  outputPages: number | null;
  outputBytes: number | null;
  partial: boolean;
  killConversion: (() => void) | null;
  finalizing: boolean;
}

class Limiter {
  private active = 0;
  private waiters: Array<() => void> = [];
  constructor(private readonly max: number) {}
  get waiting(): number {
    return this.waiters.length;
  }
  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.max) await new Promise<void>((resolve) => this.waiters.push(resolve)); // slot handed over
    else this.active++;
    try {
      return await fn();
    } finally {
      const next = this.waiters.shift();
      if (next) next();
      else this.active--;
    }
  }
}

const jobs = new Map<string, Job>();
const log = (id: string, message: string) => console.log(`[job ${id.slice(0, 8)}] ${message}`);
let limiter = new Limiter(config.concurrency);
const GRACE_MS = 10 * 60_000;

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function toStatus(job: Job) {
  return {
    id: job.id,
    state: job.state,
    sourceFormat: job.sourceFormat,
    slideCount: job.slideCount,
    hiddenSlides: job.hiddenSlides,
    slideSize: job.slideSize,
    errorCode: job.errorCode ?? (job.state === "expired" ? "expired" : job.state === "cancelled" ? "cancelled" : null),
    outputPages: job.outputPages,
    outputBytes: job.outputBytes,
    partial: job.partial,
    expiresAt: new Date(job.expiresAt).toISOString(),
  };
}

function advance(job: Job, next: JobState): void {
  if (isTerminal(job.state)) throw new CancelledError();
  assertTransition(job.state, next);
  job.state = next;
}

// Windows can briefly lock files right after LibreOffice exits, so retry the delete.
async function removeDir(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 }).catch(() => undefined);
}

function failJob(job: Job, code: ErrorCode): void {
  if (isTerminal(job.state)) return;
  job.state = "failed";
  job.errorCode = code;
  log(job.id, `failed: ${code}`);
  job.masterPath = job.outputPath = null;
  void removeDir(job.dir);
}

export async function createJob(input: Readable, rawName: string): Promise<Job> {
  if (jobs.size >= config.maxJobs || limiter.waiting >= config.maxWaiting) throw new JobError("worker-busy");

  const id = randomBytes(24).toString("base64url");
  const dir = path.join(config.workDir, id);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const uploadPath = path.join(dir, "upload.bin");

  let received = 0;
  const counter = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      received += chunk.length;
      if (received > config.maxUploadBytes) return callback(new JobError("file-too-large"));
      callback(null, chunk);
    },
  });
  try {
    await pipeline(input, counter, createWriteStream(uploadPath, { mode: 0o600 }));
  } catch (error) {
    await removeDir(dir);
    throw error instanceof JobError ? error : new JobError("internal");
  }
  if (received === 0) {
    await removeDir(dir);
    throw new JobError("empty-file");
  }

  const job: Job = {
    id,
    state: "queued",
    dir,
    sourceName: rawName.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 200),
    sourceFormat: null,
    expiresAt: Date.now() + config.retentionMs,
    slideCount: null,
    hiddenSlides: null,
    slideSize: null,
    errorCode: null,
    masterPath: null,
    outputPath: null,
    outputPages: null,
    outputBytes: null,
    partial: false,
    killConversion: null,
    finalizing: false,
  };
  jobs.set(id, job);
  log(id, `created (${job.sourceName}, ${received} bytes)`);
  void runPipeline(job, uploadPath);
  return job;
}

async function runPipeline(job: Job, uploadPath: string): Promise<void> {
  try {
    await limiter.run(async () => {
      advance(job, "validating");
      const container = await sniffContainer(uploadPath);
      if (container === "unknown") throw new JobError("invalid-file");
      if (container === "ole" && (await isEncryptedOoxml(uploadPath))) throw new JobError("encrypted");

      const format = container === "zip" ? "pptx" : "ppt";
      const source = path.join(job.dir, `source.${format}`);
      await rename(uploadPath, source);
      job.sourceFormat = format;

      advance(job, "inspecting");
      if (format === "pptx") {
        const info = await inspectPptx(source);
        job.slideCount = info.slideCount;
        job.hiddenSlides = info.hiddenSlides;
        if (info.widthPt && info.heightPt) job.slideSize = { widthPt: info.widthPt, heightPt: info.heightPt };
      }

      advance(job, "converting");
      const masterPath = await convertToPdf({
        dir: job.dir,
        input: source,
        onSpawn: (kill) => {
          job.killConversion = kill;
        },
      });
      job.killConversion = null;

      advance(job, "verifying");
      const pdf = await verifyPdf(masterPath);
      if (pdf.pages > config.maxSlides) throw new JobError("too-many-slides");

      if (job.slideCount !== pdf.pages) {
        // Legacy .ppt, or an unexpected page/slide mismatch: trust the PDF, drop hidden-slide info.
        job.slideCount = pdf.pages;
        job.hiddenSlides = null;
      }
      job.slideSize ??= { widthPt: pdf.firstPage.width, heightPt: pdf.firstPage.height };
      job.masterPath = masterPath;
      advance(job, "ready");
      log(job.id, `ready (${pdf.pages} slides)`);
    });
  } catch (error) {
    if (error instanceof CancelledError) return;
    failJob(job, error instanceof JobError ? error.code : "internal");
  }
}

export function resolveSelection(
  slideCount: number,
  hiddenSlides: number[] | null,
  request: FinalizeRequest,
): number[] {
  let slides: number[];
  if (request.slides === null) {
    slides = Array.from({ length: slideCount }, (_, i) => i + 1);
  } else {
    const seen = new Set<number>();
    slides = [];
    for (const n of request.slides) {
      if (!Number.isInteger(n) || n < 1 || n > slideCount) throw new JobError("invalid-selection");
      if (!seen.has(n)) {
        seen.add(n);
        slides.push(n);
      }
    }
  }
  if (!request.includeHidden && hiddenSlides?.length) {
    const hidden = new Set(hiddenSlides);
    slides = slides.filter((n) => !hidden.has(n));
  }
  if (slides.length === 0) throw new JobError("no-slides-selected");
  return slides.map((n) => n - 1);
}

export async function finalizeJob(job: Job, request: FinalizeRequest): Promise<Job> {
  if ((job.state !== "ready" && job.state !== "completed") || job.finalizing || !job.masterPath || job.slideCount === null) {
    throw new JobError("invalid-state");
  }
  job.finalizing = true;
  try {
    const indexes = resolveSelection(job.slideCount, job.hiddenSlides, request);
    const tmp = path.join(job.dir, "output.tmp.pdf");
    try {
      await buildOutput(job.masterPath, tmp, indexes, request.pageSize, request.orientation);
    } catch {
      throw new JobError("invalid-output");
    }
    const pdf = await verifyPdf(tmp);
    if (pdf.pages !== indexes.length) throw new JobError("invalid-output");

    if (isTerminal(job.state)) throw new CancelledError();
    const finalPath = path.join(job.dir, "output.pdf");
    // rename() over an existing file fails on Windows, so remove the previous result first.
    await rm(finalPath, { force: true });
    await rename(tmp, finalPath);
    job.outputPath = finalPath;
    job.outputPages = pdf.pages;
    job.outputBytes = (await stat(finalPath)).size;
    job.partial = indexes.length !== job.slideCount;
    if (job.state === "ready") advance(job, "completed");
    return job;
  } finally {
    job.finalizing = false;
  }
}

export async function deleteJob(id: string): Promise<void> {
  const job = jobs.get(id);
  if (!job) return;
  log(id, `deleted by request while in state "${job.state}"`);
  job.killConversion?.();
  if (canTransition(job.state, "cancelled")) job.state = "cancelled";
  jobs.delete(id);
  await removeDir(job.dir);
}

function sweep(): void {
  const now = Date.now();
  for (const job of jobs.values()) {
    if (now > job.expiresAt && !isTerminal(job.state)) {
      log(job.id, "expired");
      job.killConversion?.();
      job.state = "expired";
      job.masterPath = job.outputPath = null;
      void removeDir(job.dir);
    }
    if (now > job.expiresAt + GRACE_MS) {
      jobs.delete(job.id);
      void removeDir(job.dir);
    }
  }
}

export async function startJobs(): Promise<void> {
  await rm(config.workDir, { recursive: true, force: true });
  await mkdir(config.workDir, { recursive: true, mode: 0o700 });
  limiter = new Limiter(config.concurrency);
  setInterval(sweep, 60_000).unref();
}

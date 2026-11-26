import { createHash, timingSafeEqual } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { pipeline } from "node:stream/promises";
import { config } from "./config.js";
import { CancelledError, HTTP_STATUS, JobError, type ErrorCode } from "./errors.js";
import { createJob, deleteJob, finalizeJob, getJob, startJobs, toStatus, type FinalizeRequest } from "./jobs.js";

if (config.secret.length < 16) {
  console.error('WORKER_SECRET must be set (at least 16 characters). Copy ".env.example" to ".env" and edit it.');
  process.exit(1);
}
const version = spawnSync(config.sofficeBin, ["--version"], { encoding: "utf8", windowsHide: true });
if (version.error || version.status !== 0) {
  console.error(`LibreOffice was not found (tried: ${config.sofficeBin}).`);
  console.error("Install LibreOffice, or set SOFFICE_BIN in .env to the full path of soffice(.exe).");
  process.exit(1);
}
console.log(`worker starting with ${version.stdout.trim()}`);

const expectedSecret = createHash("sha256").update(config.secret).digest();

function authorized(req: IncomingMessage): boolean {
  const provided = createHash("sha256").update(String(req.headers["x-worker-secret"] ?? "")).digest();
  return timingSafeEqual(provided, expectedSecret);
}

function send(res: ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(json),
    "cache-control": "no-store",
  });
  res.end(json);
}

function sendError(res: ServerResponse, code: ErrorCode): void {
  send(res, HTTP_STATUS[code], { error: { code } });
}

async function readJson(req: IncomingMessage, limit = 32 * 1024): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > limit) throw new JobError("invalid-selection");
    chunks.push(chunk as Buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new JobError("invalid-selection");
  }
}

function parseFinalize(body: unknown): FinalizeRequest {
  const b = body as Record<string, unknown> | null;
  const slides = b?.slides;
  const ok =
    b &&
    (slides === null || (Array.isArray(slides) && slides.length <= 1000 && slides.every((n) => Number.isInteger(n)))) &&
    ["original", "a4", "letter"].includes(String(b.pageSize)) &&
    ["auto", "portrait", "landscape"].includes(String(b.orientation)) &&
    typeof b.includeHidden === "boolean";
  if (!ok) throw new JobError("invalid-selection");
  return b as unknown as FinalizeRequest;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://worker");

    if (req.method === "GET" && url.pathname === "/healthz") return send(res, 200, { ok: true });
    if (!authorized(req)) return send(res, 401, { error: { code: "internal" } });

    if (req.method === "POST" && url.pathname === "/jobs") {
      const name = url.searchParams.get("name") ?? "";
      if (!/\.pptx?$/i.test(name)) {
        res.setHeader("connection", "close");
        return sendError(res, "unsupported-type");
      }
      const job = await createJob(req, name);
      return send(res, 202, toStatus(job));
    }

    const match = /^\/jobs\/([A-Za-z0-9_-]{20,64})(?:\/(finalize|result))?$/.exec(url.pathname);
    if (!match) return sendError(res, "not-found");
    const [, id, action] = match as unknown as [string, string, string | undefined];
    const job = getJob(id);

    if (req.method === "DELETE" && !action) {
      await deleteJob(id);
      return send(res, 200, { deleted: true });
    }
    if (!job) {
      console.log(`[job ${id.slice(0, 8)}] ${req.method} ${action ?? "status"} -> unknown job (deleted, expired, or worker restarted)`);
      return sendError(res, "not-found");
    }

    if (req.method === "GET" && !action) return send(res, 200, toStatus(job));

    if (req.method === "POST" && action === "finalize") {
      const updated = await finalizeJob(job, parseFinalize(await readJson(req)));
      return send(res, 200, toStatus(updated));
    }

    if (req.method === "GET" && action === "result") {
      if (job.state !== "completed" || !job.outputPath) return sendError(res, "invalid-state");
      const info = await stat(job.outputPath);
      res.writeHead(200, {
        "content-type": "application/pdf",
        "content-length": info.size,
        "x-source-name": encodeURIComponent(job.sourceName),
        "x-partial": job.partial ? "1" : "0",
        "cache-control": "no-store",
      });
      await pipeline(createReadStream(job.outputPath), res);
      return;
    }

    return sendError(res, "not-found");
  } catch (error) {
    if (res.headersSent) return void res.destroy();
    if (error instanceof JobError) return sendError(res, error.code);
    if (error instanceof CancelledError) return sendError(res, "not-found");
    console.error("unhandled error:", error instanceof Error ? `${error.name}: ${error.message}` : "unknown");
    sendError(res, "internal");
  }
});

server.requestTimeout = 10 * 60_000;
server.headersTimeout = 30_000;

await startJobs();
// Listen on localhost only: the Next.js server on the same machine talks to it, the internet does not.
server.listen(config.port, process.env.HOST ?? "127.0.0.1", () =>
  console.log(`worker listening on http://127.0.0.1:${config.port}`),
);
const shutdown = () => server.close(() => process.exit(0));
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

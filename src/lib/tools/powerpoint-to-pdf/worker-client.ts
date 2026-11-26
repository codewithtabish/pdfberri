import "server-only";

export const MAX_UPLOAD_BYTES = Number(process.env.PPT_MAX_UPLOAD_BYTES) || 100 * 1024 * 1024;

export function errorResponse(code: string, status: number): Response {
  return Response.json({ error: { code } }, { status, headers: { "Cache-Control": "no-store" } });
}

export function isValidJobId(id: string): boolean {
  return /^[A-Za-z0-9_-]{20,64}$/.test(id);
}

/** Calls the conversion worker. Never throws: failures become a 503 response. */
export async function workerFetch(
  path: string,
  init: RequestInit & { duplex?: "half" } = {},
): Promise<Response> {
  // Read at call time so a changed .env.local is picked up after a restart.
  const workerUrl = process.env.PPT_WORKER_URL;
  const workerSecret = process.env.PPT_WORKER_SECRET;

  if (!workerUrl || !workerSecret) {
    console.error(
      `[ppt] Missing env: PPT_WORKER_URL=${workerUrl ? "set" : "MISSING"}, PPT_WORKER_SECRET=${workerSecret ? "set" : "MISSING"}. ` +
        "Add them to .env.local (project root) and restart npm run dev.",
    );
    return errorResponse("worker-unavailable", 503);
  }
  try {
    return await fetch(`${workerUrl}${path}`, {
      ...init,
      headers: { ...(init.headers as Record<string, string>), "x-worker-secret": workerSecret },
      cache: "no-store",
    });
  } catch (error) {
    const cause = (error as { cause?: { code?: string; message?: string } }).cause;
    console.error(
      `[ppt] Could not reach the worker at ${workerUrl}: ${cause?.code ?? ""} ${cause?.message ?? (error as Error).message}. ` +
        "Is the worker running (npm start in services/powerpoint-worker)?",
    );
    return errorResponse("worker-unavailable", 503);
  }
}

/** Relays a worker JSON response, hiding anything unexpected (HTML error pages, stack traces). */
export async function relayJson(upstream: Response): Promise<Response> {
  const text = await upstream.text();
  try {
    const parsed: unknown = JSON.parse(text);
    return Response.json(parsed, { status: upstream.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return errorResponse("worker-unavailable", 502);
  }
}

// In-memory limiter: fine for one instance. Use your shared limiter (Redis/Upstash) if you run several.
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit = 10, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

import { WORD_TO_PDF_LIMITS } from "@/components/pages/tools/word-to-pdf/word-to-pdf-constants";
import { toWordToPdfError } from "@/components/pages/tools/word-to-pdf/word-to-pdf-errors";
import { verifyPdfBytes } from "@/components/pages/tools/word-to-pdf/word-to-pdf-pdf-verify";
import type { WordToPdfErrorCode } from "@/components/pages/tools/word-to-pdf/word-to-pdf-types";
import { buildPdfFileName } from "@/components/pages/tools/word-to-pdf/word-to-pdf-utils";
import { validateWordFile } from "@/components/pages/tools/word-to-pdf/word-to-pdf-validation";
import {
  acquireJobSlot,
  convertWithLibreOffice,
  getClientKey,
  getRateLimiter,
  isSameOriginRequest,
  readServerConfig,
  statusForCode,
} from "@/lib/word-to-pdf/word-to-pdf-server";

const NO_STORE = { "Cache-Control": "no-store" } as const;

function errorResponse(code: WordToPdfErrorCode): Response {
  return Response.json(
    { error: { code } },
    {
      status: statusForCode(code),
      headers: NO_STORE,
    },
  );
}

export async function GET(): Promise<Response> {
  const config = readServerConfig();

  return Response.json(
    {
      available: config.enabled,
      maxFileBytes: config.maxFileBytes,
    },
    {
      headers: NO_STORE,
    },
  );
}

export async function POST(request: Request): Promise<Response> {
  const config = readServerConfig();

  if (!config.enabled) {
    return errorResponse("ENGINE_UNAVAILABLE");
  }

  if (!isSameOriginRequest(request)) {
    return errorResponse("FORBIDDEN");
  }

  const limiter = getRateLimiter(config.rateLimitPerMinute);

  if (!limiter.consume(getClientKey(request))) {
    return errorResponse("RATE_LIMITED");
  }

  const contentLength = Number(request.headers.get("content-length"));

  if (
    !Number.isFinite(contentLength) ||
    contentLength <= 0 ||
    contentLength > config.maxFileBytes + 64 * 1024
  ) {
    return errorResponse("FILE_TOO_LARGE");
  }

  let form: FormData;

  try {
    form = await request.formData();
  } catch {
    return errorResponse("CORRUPT_DOCUMENT");
  }

  if (form.get("consent") !== "true") {
    return errorResponse("CONSENT_REQUIRED");
  }

  const entry = form.get("file");

  if (typeof entry === "string" || entry === null) {
    return errorResponse("UNSUPPORTED_TYPE");
  }

  const file = entry as File;

  const validation = await validateWordFile(file, {
    ...WORD_TO_PDF_LIMITS,
    maxFileBytes: config.maxFileBytes,
    maxLegacyFileBytes: config.maxFileBytes,
  });

  if (!validation.ok) {
    return errorResponse(validation.error.code);
  }

  const release = acquireJobSlot(config.maxConcurrent);

  if (!release) {
    return errorResponse("SERVER_BUSY");
  }

  try {
    const input = new Uint8Array(await file.arrayBuffer());

    const output = await convertWithLibreOffice({
      input,
      format: validation.value.format,
      config,
      signal: request.signal,
    });

    await verifyPdfBytes(output);

    const fileName = buildPdfFileName(file.name);

    const asciiName = fileName
      .replace(/[^\x20-\x7e]/g, "_")
      .replace(/["\\]/g, "_");

    return new Response(output as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(output.byteLength),
        "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "X-Content-Type-Options": "nosniff",
        ...NO_STORE,
      },
    });
  } catch (error) {
    return errorResponse(toWordToPdfError(error).code);
  } finally {
    release();
  }
}

/**
 * PDFBerri HTML → PDF — Conversion API Route
 * POST /api/tools/html-to-pdf/convert
 *
 * Accepts multipart/form-data:
 *   - mode: "file" | "code" | "url"
 *   - settings: JSON string of PdfSettings
 *   - file: File (when mode=file)
 *   - content: string (when mode=code)
 *   - url: string (when mode=url)
 *
 * Returns { result: ConversionResult } or { error: ConversionError }
 */

import { NextRequest, NextResponse } from "next/server";
import { runConversion } from "@/components/pages/tools/html-to-pdf/html-to-pdf-engine";
import {
  DEFAULT_PDF_SETTINGS,
  type HtmlInput,
  type PdfSettings,
  LIMITS,
} from "@/components/pages/tools/html-to-pdf/html-to-pdf-types";
import { createError } from "@/components/pages/tools/html-to-pdf/html-to-pdf-validation";

// Note: Do NOT export `runtime = "nodejs"` when using nextConfig.cacheComponents
// Playwright still requires Node.js runtime — make sure your deployment supports it.

export const maxDuration = 60; // seconds (Vercel Pro / compatible hosts)

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          error: createError("UNSUPPORTED_CONTENT", {
            message: "Expected multipart/form-data",
          }),
        },
        { status: 400 }
      );
    }

    const form = await req.formData();
    const mode = (form.get("mode") as string) || "file";
    const settingsRaw = form.get("settings") as string | null;

    let settings: PdfSettings = { ...DEFAULT_PDF_SETTINGS };
    if (settingsRaw) {
      try {
        settings = { ...DEFAULT_PDF_SETTINGS, ...JSON.parse(settingsRaw) };
      } catch {
        // keep defaults
      }
    }

    const input: HtmlInput = { mode: mode as HtmlInput["mode"] };

    if (mode === "file") {
      const file = form.get("file");
      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { error: createError("EMPTY_HTML") },
          { status: 400 }
        );
      }
      if (file.size > LIMITS.maxHtmlSizeBytes) {
        return NextResponse.json(
          { error: createError("FILE_TOO_LARGE") },
          { status: 413 }
        );
      }
      input.file = file;
      input.filename = file.name;
    } else if (mode === "code") {
      const content = (form.get("content") as string) || "";
      input.content = content;
    } else if (mode === "url") {
      const url = (form.get("url") as string) || "";
      input.url = url;
    } else {
      return NextResponse.json(
        { error: createError("UNSUPPORTED_CONTENT") },
        { status: 400 }
      );
    }

    const result = await runConversion(input, settings);

    return NextResponse.json({ result });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && "title" in err) {
      const code = (err as any).code;
      const status =
        code === "UNSAFE_URL" || code === "UNAUTHORIZED"
          ? 403
          : code === "FILE_TOO_LARGE" || code === "OUTPUT_TOO_LARGE"
            ? 413
            : 400;

      return NextResponse.json({ error: err }, { status });
    }

    console.error("[html-to-pdf API]", err);
    return NextResponse.json(
      { error: createError("INTERNAL_ERROR") },
      { status: 500 }
    );
  }
}
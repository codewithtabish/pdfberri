/**
 * PDFBerri HTML → PDF — Main Conversion Engine
 * Orchestrates validation → preparation → isolated Chromium render → PDF.
 */

import {
  getBrowser,
  createIsolatedContext,
  createPage,
  closePageAndContext,
} from "./html-to-pdf-browser";
import { prepareHtmlDocument, sanitizeHtmlForRendering } from "./html-to-pdf-sanitizer";
import { generatePdfFromPage, waitForResources } from "./html-to-pdf-generator";
import { generateJobId, generatePdfFilename } from "./html-to-pdf-filenames";
import { createError, validateHtmlFile, validatePastedHtml, validateUrl } from "./html-to-pdf-validation";
import { HTML_TO_PDF_CONFIG } from "./html-to-pdf-config";
import type {
  ConversionJob,
  ConversionResult,
  HtmlInput,
  PdfSettings,
  ConversionStage,
} from "./html-to-pdf-types";
import { LIMITS } from "./html-to-pdf-types";

export type ProgressCallback = (stage: ConversionStage, message?: string, progress?: number) => void;

/**
 * Convert HTML content (file / pasted code) to PDF.
 * URL conversion is handled separately with stricter SSRF controls.
 */
export async function convertHtmlToPdf(
  input: HtmlInput,
  settings: PdfSettings,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  const jobId = generateJobId();
  const report = (stage: ConversionStage, message?: string, progress?: number) => {
    onProgress?.(stage, message, progress);
  };

  report("validating", "Checking your HTML...");

  let htmlContent: string;
  let originalName: string | undefined;

  if (input.mode === "file" && input.file) {
    const result = await validateHtmlFile(input.file);
    if (!result.ok) throw result.error;
    htmlContent = result.content;
    originalName = input.file.name;
  } else if (input.mode === "code") {
    const result = validatePastedHtml(input.content || "");
    if (!result.ok) throw result.error;
    htmlContent = result.content;
    originalName = "pasted-html";
  } else {
    throw createError("UNSUPPORTED_CONTENT");
  }

  report("preparing", "Preparing your document...");

  const sanitized = sanitizeHtmlForRendering(htmlContent);
  const prepared = prepareHtmlDocument(sanitized, settings);

  report("resource-loading", "Loading styles, fonts, and images...");

  let page;
  let context;
  try {
    const browser = await getBrowser();
    context = await createIsolatedContext(browser, {
      disableJavascript: !HTML_TO_PDF_CONFIG.features.javascriptExecution,
    });
    page = await createPage(context);

    report("rendering", "Rendering your HTML...");

    // Set content with a data URL base so relative resources resolve safely
    await page.setContent(prepared.html, {
      waitUntil: "domcontentloaded",
      timeout: LIMITS.navigationTimeoutMs,
    });

    await waitForResources(page, 12_000);

    report("generating-pdf", "Generating your PDF...");

    const pdfResult = await generatePdfFromPage(page, settings);

    report("validating-pdf", "Checking your PDF...");

    // Final size check already done inside generator
    const filename = generatePdfFilename(originalName, jobId);

    // In a real deployment the buffer is written to private temp storage
    // and a short-lived signed download URL is returned.
    // Here we return a data URL for local/demo use; production should use storage.
    const downloadUrl = `data:application/pdf;base64,${pdfResult.buffer.toString("base64")}`;

    report("completed", "Your PDF is ready!", 100);

    return {
      jobId,
      filename,
      sizeBytes: pdfResult.sizeBytes,
      pageCount: pdfResult.pageCount,
      downloadUrl,
      expiresAt: Date.now() + HTML_TO_PDF_CONFIG.storage.downloadTokenTtlMs,
      mimeType: "application/pdf",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    if (message === "OUTPUT_TOO_LARGE") {
      throw createError("OUTPUT_TOO_LARGE");
    }
    if (message.includes("timeout") || message.includes("Timeout")) {
      throw createError("RENDERING_TIMEOUT");
    }
    if (message.includes("browser") || message.includes("launch")) {
      throw createError("BROWSER_INIT_FAILED");
    }

    console.error("[html-to-pdf] conversion failed", { jobId, message });
    throw createError("PDF_GENERATION_FAILED", {
      message: "We could not create a valid PDF from your HTML.",
    });
  } finally {
    await closePageAndContext(page, context);
  }
}

/**
 * Convert a public HTTPS URL to PDF with SSRF protections.
 * Call only after validateUrl has passed on the client + server.
 */
export async function convertUrlToPdf(
  rawUrl: string,
  settings: PdfSettings,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  const jobId = generateJobId();
  const report = (stage: ConversionStage, message?: string, progress?: number) => {
    onProgress?.(stage, message, progress);
  };

  report("validating", "Checking URL...");

  const urlCheck = validateUrl(rawUrl);
  if (!urlCheck.ok) throw urlCheck.error;

  const targetUrl = urlCheck.url.toString();

  report("preparing", "Preparing navigation...");

  let page;
  let context;
  try {
    const browser = await getBrowser();
    context = await createIsolatedContext(browser, {
      disableJavascript: !HTML_TO_PDF_CONFIG.features.javascriptExecution,
    });
    page = await createPage(context);

    report("resource-loading", "Loading page resources...");

    // Navigate with strict timeout
    const response = await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: LIMITS.navigationTimeoutMs,
    });

    if (!response || !response.ok()) {
      throw createError("RESOURCE_LOAD_FAILED", {
        message: `Page returned status ${response?.status() ?? "unknown"}`,
      });
    }

    // Re-check final URL after redirects (SSRF defense)
    const finalUrl = page.url();
    const finalCheck = validateUrl(finalUrl);
    if (!finalCheck.ok) {
      throw createError("UNSAFE_URL", {
        message: "The page redirected to a blocked destination.",
      });
    }

    await waitForResources(page, 15_000);

    report("rendering", "Rendering page...");
    report("generating-pdf", "Generating your PDF...");

    const pdfResult = await generatePdfFromPage(page, settings);

    report("validating-pdf", "Checking your PDF...");

    const hostname = new URL(finalUrl).hostname.replace(/[^a-z0-9.-]/gi, "-");
    const filename = generatePdfFilename(hostname, jobId);

    const downloadUrl = `data:application/pdf;base64,${pdfResult.buffer.toString("base64")}`;

    report("completed", "Your PDF is ready!", 100);

    return {
      jobId,
      filename,
      sizeBytes: pdfResult.sizeBytes,
      pageCount: pdfResult.pageCount,
      downloadUrl,
      expiresAt: Date.now() + HTML_TO_PDF_CONFIG.storage.downloadTokenTtlMs,
      mimeType: "application/pdf",
    };
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err) {
      throw err; // already a ConversionError
    }
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("timeout") || message.includes("Timeout")) {
      throw createError("RENDERING_TIMEOUT");
    }
    console.error("[html-to-pdf] URL conversion failed", { jobId, message });
    throw createError("PDF_GENERATION_FAILED");
  } finally {
    await closePageAndContext(page, context);
  }
}

/**
 * High-level entry used by the API route / server action.
 */
export async function runConversion(
  input: HtmlInput,
  settings: PdfSettings,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  if (input.mode === "url") {
    return convertUrlToPdf(input.url || "", settings, onProgress);
  }
  return convertHtmlToPdf(input, settings, onProgress);
}

/**
 * PDFBerri HTML → PDF — PDF Generation
 */

import type { Page } from "playwright-core";
import { settingsToPlaywrightPdfOptions } from "./html-to-pdf-page-layout";
import type { PdfSettings, PdfGenerationResult } from "./html-to-pdf-types";
import { LIMITS } from "./html-to-pdf-types";

/**
 * Generate a PDF from an already-loaded page.
 */
export async function generatePdfFromPage(
  page: Page,
  settings: PdfSettings
): Promise<PdfGenerationResult> {
  const pdfOptions = settingsToPlaywrightPdfOptions(settings);

  const buffer = await page.pdf({
    ...pdfOptions,
    // Ensure we wait for network idle-ish state is handled by caller
  });

  if (!buffer || buffer.length === 0) {
    throw new Error("Empty PDF buffer returned");
  }

  if (buffer.length > LIMITS.maxOutputPdfBytes) {
    throw new Error("OUTPUT_TOO_LARGE");
  }

  // Basic PDF magic-byte validation
  if (buffer[0] !== 0x25 || buffer[1] !== 0x50 || buffer[2] !== 0x44 || buffer[3] !== 0x46) {
    throw new Error("Invalid PDF signature");
  }

  // Approximate page count by counting /Type /Page (rough but useful)
  const pageCount = estimatePageCount(buffer);

  return {
    buffer: Buffer.from(buffer),
    pageCount,
    sizeBytes: buffer.length,
  };
}

function estimatePageCount(buffer: Buffer): number {
  // Count occurrences of /Type /Page (not /Pages)
  const str = buffer.toString("latin1");
  const matches = str.match(/\/Type\s*\/Page[^s]/g);
  return matches ? Math.max(1, matches.length) : 1;
}

/**
 * Wait for fonts and images to settle before printing.
 */
export async function waitForResources(page: Page, timeoutMs = 15_000): Promise<void> {
  try {
    // Wait for network to quiet
    await page.waitForLoadState("networkidle", { timeout: timeoutMs }).catch(() => {});

    // Explicitly wait for fonts
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    }).catch(() => {});

    // Small extra settle time for layout
    await page.waitForTimeout(300);
  } catch {
    // Continue even if some resources timed out
  }
}

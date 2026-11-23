/**
 * PDFBerri HTML → PDF — Runtime Configuration
 * Central place for tunable limits and feature flags.
 */

import { LIMITS, DEFAULT_PDF_SETTINGS } from "./html-to-pdf-types";

export const HTML_TO_PDF_CONFIG = {
  // Feature flags
  features: {
    fileUpload: true,
    pasteHtml: true,
    urlConversion: true, // only enable when secure SSRF-protected backend is live
    zipPackage: false, // optional advanced feature
    javascriptExecution: false, // disabled by default for security
    headersFooters: true,
    pageNumbers: true,
  },

  // Limits (re-exported for convenience)
  limits: LIMITS,

  // Default settings
  defaults: DEFAULT_PDF_SETTINGS,

  // Storage
  storage: {
    tempDir: process.env.HTML_TO_PDF_TEMP_DIR || "/tmp/pdfberri-html-to-pdf",
    prefix: "h2p_",
    downloadTokenTtlMs: 15 * 60 * 1000, // 15 minutes
  },

  // Playwright / Chromium
  browser: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-sync",
      "--disable-translate",
      "--hide-scrollbars",
      "--metrics-recording-only",
      "--mute-audio",
      "--no-first-run",
      "--safebrowsing-disable-auto-update",
    ],
    // Prefer system Chromium if available in production
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  },

  // SSRF / network policy
  network: {
    allowedSchemes: ["https:", "http:"] as const, // prefer https
    blockedHostnames: [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "::1",
      "metadata.google.internal",
      "169.254.169.254", // cloud metadata
    ],
    blockedIpRanges: [
      // private & reserved (checked at resolution time)
      "10.0.0.0/8",
      "172.16.0.0/12",
      "192.168.0.0/16",
      "127.0.0.0/8",
      "169.254.0.0/16",
      "0.0.0.0/8",
      "fc00::/7",
      "fe80::/10",
      "::1/128",
    ],
    maxRedirects: 5,
  },
} as const;

export type HtmlToPdfConfig = typeof HTML_TO_PDF_CONFIG;

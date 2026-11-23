/**
 * PDFBerri HTML → PDF — Isolated Chromium Browser Manager
 * Uses Playwright for high-fidelity rendering.
 * Each conversion gets an isolated browser context.
 */

import type { Browser, BrowserContext, Page } from "playwright-core";
import { HTML_TO_PDF_CONFIG } from "./html-to-pdf-config";
import { LIMITS } from "./html-to-pdf-types";

let sharedBrowser: Browser | null = null;
let launching: Promise<Browser> | null = null;

/**
 * Lazily launch a shared Chromium instance.
 * In serverless / constrained environments prefer launching per-job
 * or using a managed browser service.
 */
export async function getBrowser(): Promise<Browser> {
  if (sharedBrowser && sharedBrowser.isConnected()) {
    return sharedBrowser;
  }

  if (launching) {
    return launching;
  }

  launching = (async () => {
    // Dynamic import so the package is optional until needed
    const { chromium } = await import("playwright-core");

    const browser = await chromium.launch({
      headless: HTML_TO_PDF_CONFIG.browser.headless,
      args: [...HTML_TO_PDF_CONFIG.browser.args],
      executablePath: HTML_TO_PDF_CONFIG.browser.executablePath,
      timeout: 30_000,
    });

    sharedBrowser = browser;
    launching = null;

    browser.on("disconnected", () => {
      sharedBrowser = null;
    });

    return browser;
  })();

  return launching;
}

export async function createIsolatedContext(
  browser: Browser,
  options?: { baseUrl?: string; disableJavascript?: boolean }
): Promise<BrowserContext> {
  const context = await browser.newContext({
    javaScriptEnabled: !(options?.disableJavascript ?? true),
    bypassCSP: false,
    ignoreHTTPSErrors: false,
    viewport: { width: 1280, height: 720 },
    // Block dangerous permissions
    permissions: [],
    // No geolocation, camera, etc.
  });

  // Extra hardening: intercept requests and block dangerous destinations
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = request.url();

    try {
      const parsed = new URL(url);

      // Block non-http(s)
      if (!["http:", "https:", "data:", "blob:"].includes(parsed.protocol)) {
        return route.abort("blockedbyclient");
      }

      // Block local / private patterns at request time
      const host = parsed.hostname.toLowerCase();
      if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "0.0.0.0" ||
        host === "::1" ||
        host.endsWith(".local") ||
        host.endsWith(".internal") ||
        host === "metadata.google.internal" ||
        host === "169.254.169.254"
      ) {
        return route.abort("blockedbyclient");
      }

      // Allow data: and blob: for embedded resources
      if (parsed.protocol === "data:" || parsed.protocol === "blob:") {
        return route.continue();
      }

      return route.continue();
    } catch {
      return route.abort("failed");
    }
  });

  return context;
}

export async function createPage(context: BrowserContext): Promise<Page> {
  const page = await context.newPage();

  // Set reasonable timeouts
  page.setDefaultTimeout(LIMITS.navigationTimeoutMs);
  page.setDefaultNavigationTimeout(LIMITS.navigationTimeoutMs);

  return page;
}

/**
 * Close everything cleanly.
 */
export async function closePageAndContext(page?: Page, context?: BrowserContext) {
  try {
    if (page && !page.isClosed()) await page.close();
  } catch {
    // ignore
  }
  try {
    if (context) await context.close();
  } catch {
    // ignore
  }
}

/**
 * Full shutdown — use on process exit or worker recycle.
 */
export async function shutdownBrowser() {
  if (sharedBrowser) {
    try {
      await sharedBrowser.close();
    } catch {
      // ignore
    }
    sharedBrowser = null;
  }
}

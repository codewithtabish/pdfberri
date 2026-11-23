/**
 * PDFBerri HTML → PDF — Isolated Chromium Browser Manager
 * Playwright + @sparticuz/chromium (Vercel compatible)
 */

import type { Browser, BrowserContext, Page } from "playwright-core";
import { HTML_TO_PDF_CONFIG } from "./html-to-pdf-config";
import { LIMITS } from "./html-to-pdf-types";

let sharedBrowser: Browser | null = null;
let launching: Promise<Browser> | null = null;

export async function getBrowser(): Promise<Browser> {
  if (sharedBrowser && sharedBrowser.isConnected()) {
    return sharedBrowser;
  }

  if (launching) {
    return launching;
  }

  launching = (async () => {
    // Rename to avoid conflict with @sparticuz/chromium
    const { chromium: playwright } = await import("playwright-core");

    const isVercel =
      !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_VERSION;

    let browser: Browser;

    if (isVercel) {
      const chromium = (await import("@sparticuz/chromium")).default;

      // Official recommended pattern for Playwright + Sparticuz
      browser = await playwright.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        // Do NOT pass headless: true here — chromium.args already contains the correct flags
      });
    } else {
      // Local development
      browser = await playwright.launch({
        headless: true,
        args: [...HTML_TO_PDF_CONFIG.browser.args],
        executablePath: HTML_TO_PDF_CONFIG.browser.executablePath,
        timeout: 30_000,
      });
    }

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
    permissions: [],
  });

  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = request.url();

    try {
      const parsed = new URL(url);

      if (!["http:", "https:", "data:", "blob:"].includes(parsed.protocol)) {
        return route.abort("blockedbyclient");
      }

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
  page.setDefaultTimeout(LIMITS.navigationTimeoutMs);
  page.setDefaultNavigationTimeout(LIMITS.navigationTimeoutMs);
  return page;
}

export async function closePageAndContext(page?: Page, context?: BrowserContext) {
  try {
    if (page && !page.isClosed()) await page.close();
  } catch {}
  try {
    if (context) await context.close();
  } catch {}
}

export async function shutdownBrowser() {
  if (sharedBrowser) {
    try {
      await sharedBrowser.close();
    } catch {}
    sharedBrowser = null;
  }
}
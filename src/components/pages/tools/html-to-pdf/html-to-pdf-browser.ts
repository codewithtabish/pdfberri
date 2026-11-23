/**
 * PDFBerri HTML → PDF — Isolated Chromium Browser Manager
 * Uses Playwright + @sparticuz/chromium for Vercel compatibility.
 */

import type { Browser, BrowserContext, Page } from "playwright-core";
import { HTML_TO_PDF_CONFIG } from "./html-to-pdf-config";
import { LIMITS } from "./html-to-pdf-types";

let sharedBrowser: Browser | null = null;
let launching: Promise<Browser> | null = null;

/**
 * Lazily launch a shared Chromium instance.
 * Automatically uses @sparticuz/chromium on Vercel.
 */
export async function getBrowser(): Promise<Browser> {
  if (sharedBrowser && sharedBrowser.isConnected()) {
    return sharedBrowser;
  }

  if (launching) {
    return launching;
  }

  launching = (async () => {
    const { chromium } = await import("playwright-core");

    const isServerless =
      !!process.env.VERCEL ||
      !!process.env.AWS_LAMBDA_FUNCTION_VERSION ||
      process.env.NODE_ENV === "production";

    let launchOptions: any = {
      headless: true,
      args: [...HTML_TO_PDF_CONFIG.browser.args],
      timeout: 30_000,
    };

    if (isServerless) {
      // Production / Vercel — use @sparticuz/chromium
      const chromiumPkg = await import("@sparticuz/chromium");
      const chromium = chromiumPkg.default || chromiumPkg;

      launchOptions = {
        ...launchOptions,
        args: [
          ...(chromium.args || []),
          ...HTML_TO_PDF_CONFIG.browser.args,
          "--disable-web-security",
          "--font-render-hinting=none",
        ],
        executablePath: await chromium.executablePath(),
        headless: true, // force true (don't rely on chromium.headless)
      };
    } else if (HTML_TO_PDF_CONFIG.browser.executablePath) {
      // Local development with custom path
      launchOptions.executablePath = HTML_TO_PDF_CONFIG.browser.executablePath;
    }

    const browser = await chromium.launch(launchOptions);

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

  // Block dangerous requests
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
  } catch {
    // ignore
  }
  try {
    if (context) await context.close();
  } catch {
    // ignore
  }
}

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
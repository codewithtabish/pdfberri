/**
 * PDFBerri HTML → PDF — HTML Sanitizer & Document Preparation
 * Prepares a safe, self-contained rendering document.
 * Does NOT strip user content aggressively — preserves structure, CSS, images.
 * Script execution is controlled at the browser level (disabled by default).
 */

import type { PreparedHtml, PdfSettings, ResolvedResource } from "./html-to-pdf-types";

/**
 * Ensures the HTML is a complete document suitable for Chromium printing.
 * Fragments are wrapped; existing documents are left intact.
 */
export function prepareHtmlDocument(
  rawHtml: string,
  settings: PdfSettings,
  baseUrl?: string
): PreparedHtml {
  const trimmed = rawHtml.trim();
  const hasDoctype = /<!DOCTYPE\s+html/i.test(trimmed);
  const hasHtmlTag = /<html[\s>]/i.test(trimmed);
  const hasHead = /<head[\s>]/i.test(trimmed);

  let html = trimmed;

  // If it's a fragment, wrap it in a minimal valid document
  if (!hasHtmlTag) {
    const printCss = buildPrintStyles(settings);
    html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Converted Document</title>
  <style>${printCss}</style>
</head>
<body>
${trimmed}
</body>
</html>`;
  } else if (!hasDoctype) {
    html = `<!DOCTYPE html>\n${html}`;
  }

  // Inject print-oriented base styles
  if (hasHtmlTag && hasHead) {
    const printCss = buildPrintStyles(settings);
    html = html.replace(
      /<\/head>/i,
      `<style data-pdfberri-print>${printCss}</style>\n</head>`
    );
  }

  // Basic resource discovery
  const discoveredUrls = discoverResources(html);

  const resources: ResolvedResource[] = discoveredUrls.map((url) => ({
    originalUrl: url,
    type: "other",
    status: "ok",
  }));

  return {
    html,
    baseUrl,
    resources,
    hasExternalResources: discoveredUrls.some((r) => r.startsWith("http")),
  };
}

function buildPrintStyles(settings: PdfSettings): string {
  const pageSize = settings.pageSize;
  const orientation = settings.orientation === "auto" ? "portrait" : settings.orientation;
  const margins =
    settings.margins === "custom" && settings.customMargins
      ? `${settings.customMargins.top}mm ${settings.customMargins.right}mm ${settings.customMargins.bottom}mm ${settings.customMargins.left}mm`
      : undefined;

  let pageRule = `@page { size: ${pageSize} ${orientation};`;
  if (margins) {
    pageRule += ` margin: ${margins};`;
  }
  pageRule += " }";

  return `
${pageRule}
html, body {
  margin: 0;
  padding: 0;
  -webkit-print-color-adjust: ${settings.printBackground ? "exact" : "economy"};
  print-color-adjust: ${settings.printBackground ? "exact" : "economy"};
}
img {
  max-width: 100%;
  height: auto;
}
table {
  border-collapse: collapse;
  page-break-inside: auto;
}
tr {
  page-break-inside: avoid;
  page-break-after: auto;
}
thead {
  display: table-header-group;
}
tfoot {
  display: table-footer-group;
}
h1, h2, h3, h4, h5, h6 {
  page-break-after: avoid;
}
p, li {
  orphans: 3;
  widows: 3;
}
`.trim();
}

function discoverResources(html: string): string[] {
  const urls: string[] = [];
  const patterns = [
    /<img[^>]+src=["']([^"']+)["']/gi,
    /<link[^>]+href=["']([^"']+)["']/gi,
    /url\(\s*["']?([^"')]+)["']?\s*\)/gi,
    /srcset=["']([^"']+)["']/gi,
  ];

  for (const re of patterns) {
    let match;
    while ((match = re.exec(html)) !== null) {
      const value = match[1];
      if (value && !value.startsWith("data:") && !value.startsWith("blob:")) {
        value.split(",").forEach((part) => {
          const u = part.trim().split(/\s+/)[0];
          if (u) urls.push(u);
        });
      }
    }
  }
  return [...new Set(urls)];
}

/**
 * Lightweight sanitization focused on preventing obvious XSS vectors.
 */
export function sanitizeHtmlForRendering(html: string): string {
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  clean = clean.replace(/\son\w+\s*=\s*(["']).*?\1/gi, "");
  clean = clean.replace(/\son\w+\s*=\s*[^\s>]+/gi, "");
  clean = clean.replace(/javascript\s*:/gi, "blocked:");
  clean = clean.replace(/data:text\/html[^"'\s>]*/gi, "blocked:");
  return clean;
}
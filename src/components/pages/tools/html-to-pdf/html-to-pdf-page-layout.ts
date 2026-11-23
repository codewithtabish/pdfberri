/**
 * PDFBerri HTML → PDF — Page Layout Helpers
 */

import {
  MARGIN_VALUES,
  PAGE_SIZE_DIMENSIONS,
  type MarginPreset,
  type Orientation,
  type PageSize,
  type PdfSettings,
} from "./html-to-pdf-types";

export function getPageDimensions(
  pageSize: PageSize,
  orientation: Orientation
): { width: string; height: string } {
  const dims = PAGE_SIZE_DIMENSIONS[pageSize];
  if (orientation === "landscape") {
    return { width: dims.height, height: dims.width };
  }
  return dims;
}

export function getMarginCss(preset: MarginPreset, custom?: PdfSettings["customMargins"]) {
  if (preset === "custom" && custom) {
    return {
      top: `${custom.top}mm`,
      right: `${custom.right}mm`,
      bottom: `${custom.bottom}mm`,
      left: `${custom.left}mm`,
    };
  }
  return MARGIN_VALUES[preset] || MARGIN_VALUES.normal;
}

/**
 * Convert settings into Playwright page.pdf() options.
 */
export function settingsToPlaywrightPdfOptions(settings: PdfSettings) {
  const margins = getMarginCss(settings.margins, settings.customMargins);
  const dims = getPageDimensions(
    settings.pageSize,
    settings.orientation === "auto" ? "portrait" : settings.orientation
  );

  // Playwright prefers numeric mm or named formats
  const formatMap: Record<PageSize, string> = {
    A4: "A4",
    Letter: "Letter",
    Legal: "Legal",
    A3: "A3",
  };

  return {
    format: formatMap[settings.pageSize] as "A4" | "Letter" | "Legal" | "A3",
    landscape: settings.orientation === "landscape",
    printBackground: settings.printBackground || settings.includeBackgroundGraphics,
    margin: {
      top: margins.top,
      right: margins.right,
      bottom: margins.bottom,
      left: margins.left,
    },
    preferCSSPageSize: false, // user settings take precedence unless advanced
    displayHeaderFooter: settings.pageNumbers || !!settings.headerText || !!settings.footerText,
    headerTemplate: settings.headerText
      ? `<div style="font-size:9px; width:100%; text-align:center; color:#666;">${escapeHtml(settings.headerText)}</div>`
      : "<div></div>",
    footerTemplate: settings.pageNumbers
      ? `<div style="font-size:9px; width:100%; text-align:center; color:#666;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`
      : settings.footerText
        ? `<div style="font-size:9px; width:100%; text-align:center; color:#666;">${escapeHtml(settings.footerText)}</div>`
        : "<div></div>",
    scale: settings.scale ?? 1,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

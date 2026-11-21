/** Single source of truth for processing limits. Tune after device testing. No React/icons here. */
export const SPLIT_CONFIG = {
  maxFileSizeBytes: 100 * 1024 * 1024,
  maxPages: 2000,
  maxOutputs: 500,
  thumbnailWidth: 180,
  thumbnailConcurrency: 3,
} as const;

export const SPLIT_ROUTE = "/tools/split-pdf";
export const SPLIT_ZIP_FILENAME = "PDFBerri-Split-Results.zip";

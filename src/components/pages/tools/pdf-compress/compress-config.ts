/** Single source of truth for compress limits and constants. No React. */
export const COMPRESS_CONFIG = {
  maxFileSizeBytes: 100 * 1024 * 1024,
  minFileSizeBytes: 1024,
  maxPages: 5000,
} as const;

export const COMPRESS_ROUTE = "/tools/compress-pdf";
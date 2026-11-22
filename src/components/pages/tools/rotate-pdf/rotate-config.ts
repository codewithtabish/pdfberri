export const ROTATE_CONFIG = {
  maxFileSizeBytes: 100 * 1024 * 1024, // 100 MB
  minFileSizeBytes: 1024,              // 1 KB
  maxPages: 2000,
  thumbnailWidth: 180,
  thumbnailConcurrency: 3,
} as const;

export const ROTATE_ROUTE = "/tools/rotate-pdf";
export const PDF_TO_JPG_CONFIG = {
  maxFileSizeBytes: 100 * 1024 * 1024, // 100 MB
  maxPages: 2000,
  thumbnailWidth: 150,
  thumbnailConcurrency: 4,
  maxPixelArea: 40_000_000, // Prevent browser crashes (~40MP limit)
} as const;

export const QUALITY_PRESETS = {
  standard: 0.6,
  high: 0.85,
  maximum: 1.0,
} as const;

export type QualityPreset = keyof typeof QUALITY_PRESETS;
export type Resolution = 72 | 150 | 200 | 300;
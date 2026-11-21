import type { CompressionMode, CompressionSettings } from "./compress-types";

export const MODE_PRESETS: Record<Exclude<CompressionMode, "custom">, CompressionSettings> = {
  recommended: {
    useObjectStreams: true,
    stripMetadata: false,
    stripXmp: false,
    updateModificationDate: false,
    pruneOrphans: true,
  },
  high: {
    useObjectStreams: true,
    stripMetadata: true,
    stripXmp: true,
    updateModificationDate: true,
    pruneOrphans: true,
  },
  "maximum-quality": {
    useObjectStreams: true,
    stripMetadata: false,
    stripXmp: false,
    updateModificationDate: false,
    pruneOrphans: false,
  },
};

export const DEFAULT_CUSTOM_SETTINGS: CompressionSettings = {
  useObjectStreams: true,
  stripMetadata: false,
  stripXmp: false,
  updateModificationDate: false,
  pruneOrphans: true,
};

export function resolveSettings(mode: CompressionMode, custom: CompressionSettings): CompressionSettings {
  if (mode === "custom") return { ...custom };
  return { ...MODE_PRESETS[mode] };
}

export function describeMode(mode: CompressionMode): string {
  switch (mode) {
    case "recommended":
      return "Balanced structural optimization. Keeps metadata intact.";
    case "high":
      return "Aggressive structural optimization: strips metadata, strips XMP, prunes orphans.";
    case "maximum-quality":
      return "Minimal safe rewrites. Nothing is removed.";
    case "custom":
      return "Your chosen options.";
  }
}
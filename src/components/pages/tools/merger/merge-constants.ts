import { MergeStage } from "./merge-types";

/**
 * Single place to tune limits. Test these on real desktop AND mobile
 * devices, then adjust. Everything runs in browser memory.
 */
export const MERGE_LIMITS = {
  maxFiles: 20,
  maxFileSizeBytes: 100 * 1024 * 1024, // 100 MB per file
  maxTotalSizeBytes: 250 * 1024 * 1024, // 250 MB combined
} as const;

export const MIN_FILES_TO_MERGE = 2;
export const DEFAULT_OUTPUT_NAME = "merged.pdf";
export const MAX_OUTPUT_NAME_LENGTH = 120;

export const MERGE_STAGES: ReadonlyArray<{ id: MergeStage; label: string }> = [
  { id: "preparing", label: "Preparing documents" },
  { id: "reading", label: "Reading PDF files" },
  { id: "combining", label: "Combining pages" },
  { id: "finalizing", label: "Preparing download" },
];
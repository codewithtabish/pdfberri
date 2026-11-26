import { PPT_ERROR_CODES, type PptErrorCode } from "./powerpoint-to-pdf-types";

const MESSAGES: Record<PptErrorCode, string> = {
  "unsupported-type": "Only .ppt and .pptx presentations are supported.",
  "empty-file": "This file is empty. Choose a presentation that contains slides.",
  "file-too-large": "This file is larger than the 100 MB limit.",
  "invalid-file": "This doesn't look like a valid PowerPoint presentation.",
  corrupt: "This presentation appears to be damaged and can't be opened.",
  encrypted:
    "This presentation is password-protected. Remove the password in PowerPoint and try again.",
  "too-many-slides": "This presentation has more slides than we can convert in one go.",
  "archive-too-large": "This presentation expands to an unusually large size and was rejected for safety.",
  "conversion-timeout": "The conversion took too long and was stopped. Try a smaller presentation.",
  "conversion-failed":
    "We couldn't convert this presentation. It may be corrupt or password-protected.",
  "out-of-memory": "This presentation needs more memory than is available. Try fewer or smaller images.",
  "invalid-output": "The conversion produced an unusable PDF. Please try again.",
  "invalid-selection": "That slide selection isn't valid for this presentation.",
  "no-slides-selected": "No slides are left to convert with these settings.",
  "invalid-state": "This conversion isn't ready for that action yet.",
  "not-found": "This conversion no longer exists. Please upload the presentation again.",
  "worker-busy": "The converter is busy right now. Please try again in a minute.",
  "worker-unavailable": "The converter is temporarily unavailable. Please try again shortly.",
  internal: "Something went wrong on our side. Please try again.",
  "rate-limited": "Too many conversions in a short time. Please wait a few minutes.",
  network: "Network problem. Check your connection and try again.",
  cancelled: "The conversion was cancelled.",
  expired: "This conversion has expired and its files were deleted. Please upload again.",
};

export function getErrorMessage(code: PptErrorCode): string {
  return MESSAGES[code];
}

export function isPptErrorCode(value: unknown): value is PptErrorCode {
  return typeof value === "string" && (PPT_ERROR_CODES as readonly string[]).includes(value);
}

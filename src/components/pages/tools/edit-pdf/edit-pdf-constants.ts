// src/components/pages/tools/edit-pdf/edit-pdf-constants.ts

import type { ActiveTool } from './edit-pdf-types';

export const TOOL_LABELS: Record<ActiveTool, string> = {
  select: 'Select',
  text: 'Add text',
  image: 'Add image',
  draw: 'Draw',
  highlight: 'Highlight',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
  rectangle: 'Rectangle',
  circle: 'Circle',
  line: 'Line',
  arrow: 'Arrow',
  whiteout: 'Whiteout',
  sign: 'Signature',
  comment: 'Comment',
  link: 'Link',
  redact: 'Redact',
  pages: 'Manage pages',
};

export const EDIT_PDF_CONFIG = {
  maxFileSizeBytes: 100 * 1024 * 1024,
  maxPageCount: 500,
  maxHistoryEntries: 60,
  
  // Renderer needs these specific keys
  MAX_DEVICE_PIXEL_RATIO: 2,
  THUMBNAIL_WIDTH: 120,
  THUMBNAIL_HEIGHT: 160,
  
  // Keep this for any other UI components that might use lowercase
  thumbnailWidth: 120,
  
  minZoom: 0.25,
  maxZoom: 4,
  zoomStep: 0.25,
  allowedMimeTypes: ['application/pdf'] as const,
  signatureCanvasSize: { width: 480, height: 200 },
  unsupportedFeatures: ['redact'] as ActiveTool[],
} as const;

/**
 * Error messages used by the PDF engine and validation logic.
 */
export const ERROR_MESSAGES = {
  ENCRYPTED_PDF: 'This PDF is password-protected. Please remove the password and try again.',
  LOAD_FAILED: 'Failed to load this PDF. The file may be corrupt or unsupported.',
  INVALID_PDF: 'This file is not a valid PDF.',
  TOO_LARGE: 'File exceeds the maximum allowed size.',
  EMPTY_FILE: 'The uploaded file is empty.',
} as const;
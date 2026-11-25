import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from './rearrange-pages-constants';

export function validatePdfFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith('.pdf')) return 'Please select a PDF file.';
  if (file.size === 0) return 'This file is empty.';
  if (file.size > MAX_FILE_SIZE_BYTES) return `File exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
  return null;
}
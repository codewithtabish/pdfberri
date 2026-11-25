import { MAX_FILE_SIZE_BYTES } from './extract-pages-constants';

export function validatePdfFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith('.pdf')) return 'Please select a PDF file.';
  if (file.size === 0) return 'This file is empty.';
  if (file.size > MAX_FILE_SIZE_BYTES) return `File exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit.`;
  return null;
}
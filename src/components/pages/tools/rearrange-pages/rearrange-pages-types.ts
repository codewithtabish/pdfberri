export interface DocumentState {
  file: File;
  filename: string;
  fileSize: number;
  pageCount: number;
  bytes: ArrayBuffer;
}

export interface PageItem {
  id: string; // Unique ID for drag and drop
  originalIndex: number; // 0-based index in the original PDF
}

export type ProcessingStatus = 'idle' | 'loading' | 'ready' | 'processing' | 'success' | 'error';

export interface OutputState {
  blob: Blob;
  filename: string;
  size: number;
}
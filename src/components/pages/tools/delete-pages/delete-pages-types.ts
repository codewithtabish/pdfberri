export interface DocumentState {
  file: File;
  filename: string;
  fileSize: number;
  pageCount: number;
  bytes: ArrayBuffer;
}

export type ProcessingStatus = 'idle' | 'loading' | 'ready' | 'confirming' | 'processing' | 'success' | 'error';

export interface OutputState {
  blob: Blob;
  filename: string;
  size: number;
  originalCount: number;
  deletedCount: number;
  remainingCount: number;
}
export interface DocumentState {
  file: File;
  filename: string;
  fileSize: number;
  pageCount: number;
  bytes: ArrayBuffer;
}

export type ProcessingStatus = 'idle' | 'loading' | 'rendering' | 'ready' | 'processing' | 'success' | 'error';
export type OutputMode = 'combined' | 'separate';

export interface OutputState {
  blob: Blob;
  filename: string;
  size: number;
}
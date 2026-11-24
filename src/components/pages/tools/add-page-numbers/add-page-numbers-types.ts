export type PagePosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type NumberFormat = 'numeric' | 'page-x' | 'page-x-of-y';
export type FontSize = 'small' | 'medium' | 'large';
export type FontColor = 'black' | 'dark-grey' | 'blue';

export interface NumberingConfig {
  position: PagePosition;
  format: NumberFormat;
  startNumber: number;
  rangeType: 'all' | 'custom';
  customRange: string;
  fontSize: FontSize;
  color: FontColor;
  isBold: boolean;
}

export interface DocumentState {
  file: File;
  filename: string;
  fileSize: number;
  pageCount: number;
  bytes: ArrayBuffer;
}

export interface OutputState {
  blob: Blob;
  filename: string;
  size: number;
  pageCount: number;
}

export type ProcessingStatus = 'idle' | 'loading' | 'ready' | 'processing' | 'success' | 'error';
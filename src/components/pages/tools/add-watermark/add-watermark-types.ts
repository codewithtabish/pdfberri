export type WatermarkType = 'text' | 'image';
export type Position = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface WatermarkConfig {
  type: WatermarkType;
  text: string;
  fontFamily: 'Helvetica' | 'TimesRoman' | 'Courier';
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number;
  
  imageFile: File | null;
  imageBytes: ArrayBuffer | null;
  imageType: 'png' | 'jpeg' | null;
  imageScale: number;

  position: Position;
  pageRange: 'all' | 'custom';
  customRange: string;
}

export interface DocumentState {
  file: File;
  filename: string;
  fileSize: number;
  pageCount: number;
  bytes: ArrayBuffer;
}

export type ProcessingStatus = 'idle' | 'loading' | 'ready' | 'processing' | 'success' | 'error';

export interface OutputState {
  blob: Blob;
  filename: string;
  size: number;
  pageCount: number;
}
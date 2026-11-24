import type { WatermarkConfig } from './add-watermark-types';

export const DEFAULT_CONFIG: WatermarkConfig = {
  type: 'text',
  text: 'CONFIDENTIAL',
  fontFamily: 'Helvetica',
  fontSize: 48,
  color: '#000000',
  opacity: 0.3,
  rotation: -45,
  imageFile: null,
  imageBytes: null,
  imageType: null,
  imageScale: 40,
  position: 'center',
  pageRange: 'all',
  customRange: '',
};

export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
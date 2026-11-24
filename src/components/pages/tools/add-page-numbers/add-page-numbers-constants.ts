import type { NumberingConfig } from './add-page-numbers-types';

export const DEFAULT_CONFIG: NumberingConfig = {
  position: 'bottom-center',
  format: 'numeric',
  startNumber: 1,
  rangeType: 'all',
  customRange: '',
  fontSize: 'medium',
  color: 'black',
  isBold: false,
};

export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
import type { ConversionSettings } from './excel-to-pdf-types';

export const MAX_FILE_MB = 25;
export const MAX_SHEETS = 50;
export const MAX_CELLS_PER_SHEET = 250_000;
export const MAX_PDF_PAGES = 1000;

export const MM_TO_PT = 72 / 25.4;

export const PAPER_PT = {
  a4: { w: 595.28, h: 841.89 },
  letter: { w: 612, h: 792 },
  legal: { w: 612, h: 1008 },
} as const;

export const MARGIN_PT = {
  normal: 54,
  narrow: 28,
  wide: 72,
} as const;

export const DEFAULT_SETTINGS: ConversionSettings = {
  paper: 'a4',
  customWidthMm: 210,
  customHeightMm: 297,
  orientation: 'auto',
  margins: 'normal',
  customMarginMm: 15,
  scaling: 'fit-width',
  showGridlines: false,
  includeHiddenSheets: false,
  includeHiddenRows: false,
  includeHiddenColumns: false,
  repeatHeaderRow: false,
  pageNumbers: true,
  sheetNameHeader: true,
  useWorkbookPrintSettings: true,
};
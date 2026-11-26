export class ConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConversionError';
  }
}

export type HAlign = 'general' | 'left' | 'center' | 'right';
export type VAlign = 'top' | 'middle' | 'bottom';
export type CellKind = 'text' | 'number' | 'bool' | 'error';

export interface BorderSide {
  color: string;
  width: number;
}

export interface CellStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  color: string | null;
  fill: string | null;
  hAlign: HAlign;
  vAlign: VAlign;
  wrap: boolean;
  top: BorderSide | null;
  right: BorderSide | null;
  bottom: BorderSide | null;
  left: BorderSide | null;
}

export interface CellModel {
  text: string;
  kind: CellKind;
  style: CellStyle;
}

export interface MergeRange {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface SheetModel {
  id: number;
  name: string;
  hidden: boolean;
  skippedReason: string | null;
  rowCount: number;
  colCount: number;
  cells: (CellModel | null)[][];
  colWidths: number[]; // points
  rowHeights: (number | null)[]; // points, null = automatic
  hiddenRows: boolean[];
  hiddenCols: boolean[];
  merges: MergeRange[];
  printArea: MergeRange | null;
  orientation: 'portrait' | 'landscape' | null;
  defaultRowHeight: number;
}

export interface SheetInfo {
  id: number;
  name: string;
  hidden: boolean;
  rowCount: number;
  colCount: number;
  hiddenRowCount: number;
  hiddenColCount: number;
  mergeCount: number;
  hasPrintSettings: boolean;
  skippedReason: string | null;
}

export type FileKind = 'xlsx' | 'csv';

export interface ParsedWorkbook {
  fileName: string;
  kind: FileKind;
  sheets: SheetModel[];
  warnings: string[];
}

export type PaperSize = 'a4' | 'letter' | 'legal' | 'custom';
export type OrientationSetting = 'auto' | 'portrait' | 'landscape';
export type MarginPreset = 'normal' | 'narrow' | 'wide' | 'custom';
export type ScalingMode = 'fit-width' | 'fit-page' | 'actual';

export interface ConversionSettings {
  paper: PaperSize;
  customWidthMm: number;
  customHeightMm: number;
  orientation: OrientationSetting;
  margins: MarginPreset;
  customMarginMm: number;
  scaling: ScalingMode;
  showGridlines: boolean;
  includeHiddenSheets: boolean;
  includeHiddenRows: boolean;
  includeHiddenColumns: boolean;
  repeatHeaderRow: boolean;
  pageNumbers: boolean;
  sheetNameHeader: boolean;
  useWorkbookPrintSettings: boolean;
}

export interface ConvertProgress {
  message: string;
  percent: number;
}

export interface ConvertResult {
  blob: Blob;
  pageCount: number;
  pageSheets: string[];
  warnings: string[];
}
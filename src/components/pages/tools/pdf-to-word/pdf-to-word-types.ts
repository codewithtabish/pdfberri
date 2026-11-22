// src/components/pages/tools/pdf-to-word/pdf-to-word-types.ts

export type ConversionMode = "layout" | "editable";

export interface ConversionOptions {
  mode: ConversionMode;
  ocrEnabled: boolean;
  ocrLanguage: string;
}

export interface PdfInspection {
  pageCount: number;
  pageWidth: number;
  pageHeight: number;
  title: string | null;
  sampledPages: number;
  textPages: number;
  scannedPages: number;
  hasExtractableText: boolean;
  likelyScanned: boolean;
}

export type ConversionStage =
  | "reading"
  | "extracting"
  | "ocr"
  | "building"
  | "validating";

export interface ConversionProgress {
  stage: ConversionStage;
  current: number;
  total: number;
}

export type ConversionErrorCode =
  | "not-a-pdf"
  | "empty-file"
  | "file-too-large"
  | "too-many-pages"
  | "corrupt-pdf"
  | "password-required"
  | "incorrect-password"
  | "no-content"
  | "ocr-failed"
  | "output-invalid"
  | "cancelled"
  | "unknown";

export class ConversionError extends Error {
  readonly code: ConversionErrorCode;

  constructor(code: ConversionErrorCode, message: string) {
    super(message);
    this.name = "ConversionError";
    this.code = code;
  }
}

export interface ConversionErrorInfo {
  code: ConversionErrorCode;
  message: string;
}

export interface ConversionStats {
  pages: number;
  paragraphs: number;
  tables: number;
  images: number;
  ocrPages: number;
}

export interface ConversionResult {
  blob: Blob;
  fileName: string;
  size: number;
  stats: ConversionStats;
  warnings: string[];
  durationMs: number;
}

export type WorkspaceState =
  | { status: "idle" }
  | { status: "validating"; file: File }
  | { status: "needs-password"; file: File; incorrect: boolean }
  | { status: "ready"; file: File; inspection: PdfInspection }
  | {
      status: "converting";
      file: File;
      inspection: PdfInspection;
      progress: ConversionProgress | null;
    }
  | {
      status: "completed";
      file: File;
      inspection: PdfInspection;
      result: ConversionResult;
    }
  | {
      status: "failed";
      file: File;
      inspection: PdfInspection | null;
      error: ConversionErrorInfo;
    }
  | { status: "cancelled"; file: File; inspection: PdfInspection };

// ------------------------------------------------------------
// Document model (all coordinates in PDF points, origin top-left)
// ------------------------------------------------------------

export interface StyledRun {
  text: string;
  bold: boolean;
  italic: boolean;
  size: number;
  font: string | null;
}

export interface RawItem {
  text: string;
  x: number;
  xEnd: number;
  baseline: number;
  size: number;
  bold: boolean;
  italic: boolean;
  font: string | null;
  rtl: boolean;
}

export interface PageImage {
  x: number;
  y: number;
  width: number;
  height: number;
  data: Uint8Array;
  kind: "png" | "jpg";
}

export interface PageContent {
  pageNumber: number;
  width: number;
  height: number;
  items: RawItem[];
  images: PageImage[];
  charCount: number;
  source: "text" | "ocr" | "none";
}

export type TextAlign = "left" | "center" | "right";

interface BlockBase {
  x: number;
  xEnd: number;
  top: number;
  bottom: number;
}

export interface ParagraphBlock extends BlockBase {
  type: "paragraph";
  runs: StyledRun[];
  size: number;
  align: TextAlign;
  heading: 0 | 1 | 2 | 3;
  indent: number;
  rtl: boolean;
}

export interface TableCellData {
  runs: StyledRun[];
  align: TextAlign;
}

export interface TableBlock extends BlockBase {
  type: "table";
  colWidths: number[];
  rows: TableCellData[][];
}

export interface ImageBlock extends BlockBase {
  type: "image";
  width: number;
  height: number;
  data: Uint8Array;
  kind: "png" | "jpg";
}

export interface ColumnsBlock extends BlockBase {
  type: "columns";
  columnX: number[];
  columnWidths: number[];
  columns: Block[][];
}

export type Block = ParagraphBlock | TableBlock | ImageBlock | ColumnsBlock;

export interface PageFlow {
  width: number;
  height: number;
  blocks: Block[];
}

export interface RunningContent {
  removal: Map<string, "static" | "page">;
  header: string | null;
  footer: string | null;
  footerPageNumber: boolean;
}
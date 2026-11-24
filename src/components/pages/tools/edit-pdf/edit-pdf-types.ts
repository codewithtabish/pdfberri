// src/components/pages/tools/edit-pdf/edit-pdf-types.ts

export type PageId = string;
export type ObjectId = string;

export type ActiveTool =
  | 'select'
  | 'text'
  | 'image'
  | 'draw'
  | 'highlight'
  | 'underline'
  | 'strikethrough'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'whiteout'
  | 'sign'
  | 'comment'
  | 'link'
  | 'redact'
  | 'pages';

export type FitMode = 'none' | 'width' | 'page';
export type DocStatus = 'idle' | 'loading' | 'ready' | 'exporting' | 'error';
export type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

export type ErrorCode =
  | 'not-pdf'
  | 'empty'
  | 'too-large'
  | 'invalid-signature'
  | 'encrypted'
  | 'corrupt'
  | 'load'
  | 'export'
  | 'memory';

export interface EditPdfError {
  code: ErrorCode;
  message: string;
}

/* -------- Editable objects -------- */
export interface BaseObject {
  id: ObjectId;
  pageId: PageId;
  x: number; // PDF user-space, origin bottom-left
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

export interface TextObject extends BaseObject {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: 'left' | 'center' | 'right';
}

export interface ImageObject extends BaseObject {
  type: 'image';
  src: string;
  mime: 'image/png' | 'image/jpeg';
}

export type AnnotationShape =
  | 'draw'
  | 'highlight'
  | 'underline'
  | 'strikethrough'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'whiteout';

export interface AnnotationObject extends BaseObject {
  type: 'annotation';
  shape: AnnotationShape;
  color: string;
  lineWidth: number;
  /** only used for shape === 'draw' */
  points?: { x: number; y: number }[];
}

export interface SignatureObject extends BaseObject {
  type: 'signature';
  src: string;
}

export interface CommentObject extends BaseObject {
  type: 'comment';
  text: string;
  color: string;
}

export interface LinkObject extends BaseObject {
  type: 'link';
  url: string;
}

export interface RedactionObject extends BaseObject {
  type: 'redaction';
  /** `true` only when the export method is verified to strip content.
   *  Currently always false in this build. */
  secure: boolean;
}

export type EditableObject =
  | TextObject
  | ImageObject
  | AnnotationObject
  | SignatureObject
  | CommentObject
  | LinkObject
  | RedactionObject;

/* -------- Document model -------- */
export interface PDFPageState {
  id: PageId;
  originalIndex: number;
  rotation: number; // 0 | 90 | 180 | 270
  width: number;
  height: number;
  objects: EditableObject[];
}

export interface DocumentModel {
  id: string;
  filename: string;
  fileSize: number;
  sourceBytes: ArrayBuffer;
  pages: PDFPageState[];
  dirty: boolean;
  status: DocStatus;
  error: EditPdfError | null;
}

/* -------- Top-level state (nested, per your toolbar) -------- */
export interface EditPdfState {
  document: DocumentModel | null;
  selection: {
    tool: ActiveTool;
    pageId: PageId | null;
    objectId: ObjectId | null;
  };
  viewport: {
    zoom: number;
    fitMode: FitMode;
  };
  export: {
    status: ExportStatus;
    error: EditPdfError | null;
  };
}

export interface HistoryEntry {
  label: string;
  undo: () => void;
  redo: () => void;
}

/* ------------------------------------------------------------------ */
/* Types expected by edit-pdf-engine.ts (Fixing the TS errors)        */
/* ------------------------------------------------------------------ */

export interface DocumentMeta {
  id: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  isEncrypted: boolean;
  isCorrupted: boolean;
  originalBytes: ArrayBuffer;
}

export interface EditPage {
  id: string;
  originalIndex: number;
  order: number;
  rotation: number;
  dimensions: {
    width: number;
    height: number;
  };
  objects: EditableObject[];
  renderStatus: "idle" | "rendering" | "ready" | "error";
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  isEncrypted?: boolean;
}
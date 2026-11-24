export type SignatureTab = "draw" | "type" | "upload";
export type FieldType = "signature" | "date" | "initials" | "text";

export type PlacedElement = {
  id: string;
  type: FieldType;
  pageIndex: number;
  x: number; // 0..1
  y: number; // 0..1
  w: number; // 0..1
  h: number; // 0..1
  dataUrl?: string;
  text?: string;
  fontSize?: number;
  color?: string;
};

export type SignPdfState = {
  status: "empty" | "loading" | "ready" | "processing" | "success" | "error";
  error: string | null;
  pdfFile: File | null;
  pdfBytes: ArrayBuffer | null;
  pageCount: number;
  currentPage: number;
  zoom: number;
  elements: PlacedElement[];
  selectedId: string | null;
  signatureTab: SignatureTab;
  signatureDataUrl: string | null;
};
export type ConversionMode = "editable" | "high-fidelity";
export type SlideSizeOption = "16:9" | "4:3" | "match";
export type FitMode = "contain" | "cover";
export type QualityOption = "standard" | "high" | "max";
export type VectorPolicy = "fallback" | "text-only";

export interface ConversionSettings {
  mode: ConversionMode;
  slideSize: SlideSizeOption;
  fit: FitMode;
  quality: QualityOption;
  vectorPolicy: VectorPolicy;
  addSlideNumbers: boolean;
}

export interface SlideSize {
  width: number; // inches
  height: number; // inches
}

export interface SlideBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ImageElement {
  type: "image";
  box: SlideBox;
  dataUrl: string;
}

export interface TextRun {
  text: string;
  fontFace: string;
  fontSize: number; // PowerPoint points
  bold: boolean;
  italic: boolean;
  color: string; // hex without #
}

export interface TextElement {
  type: "text";
  box: SlideBox;
  runs: TextRun[];
  rotate: number; // degrees clockwise, 0-359
  rtl: boolean;
}

export type SlideElement = ImageElement | TextElement;

export interface SlideModel {
  pageIndex: number;
  size: SlideSize;
  background: string; // hex without #
  elements: SlideElement[];
  fidelity: "editable" | "image";
  warnings: string[];
}

export type ProcessingStage =
  | "loading"
  | "rendering"
  | "building"
  | "validating"
  | "preparing";

export interface ProgressState {
  stage: ProcessingStage;
  current: number;
  total: number;
  percent: number;
  message: string;
}

export interface PageWarning {
  pageNumber: number | null;
  message: string;
}

export interface ConversionSummary {
  fileName: string;
  slideCount: number;
  sizeBytes: number;
  mode: ConversionMode;
  editableSlides: number;
  imageSlides: number;
  slideSize: SlideSize;
  warnings: PageWarning[];
}

export interface ConversionOutput {
  blob: Blob;
  summary: ConversionSummary;
}

export type WorkspaceStatus = "idle" | "inspecting" | "ready" | "converting" | "done";

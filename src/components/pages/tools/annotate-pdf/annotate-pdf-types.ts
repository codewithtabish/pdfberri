// src/components/pages/tools/annotate-pdf/annotate-pdf-types.ts

export type ToolId =
  | "select"
  | "hand"
  | "highlight"
  | "underline"
  | "strikethrough"
  | "pen"
  | "eraser"
  | "text"
  | "comment"
  | "rect"
  | "circle"
  | "arrow"
  | "line";

export type Point = { x: number; y: number }; // normalized 0..1 within page

type Base = {
  id: string;
  pageIndex: number;
  createdAt: number;
};

export type HighlightAnnotation = Base & {
  kind: "highlight";
  regions: { x: number; y: number; w: number; h: number }[];
  color: string;
  opacity: number;
};

export type UnderlineAnnotation = Base & {
  kind: "underline";
  segments: { x1: number; y1: number; x2: number; y2: number }[];
  color: string;
  thickness: number;
  opacity: number;
};

export type StrikethroughAnnotation = Base & {
  kind: "strikethrough";
  segments: { x1: number; y1: number; x2: number; y2: number }[];
  color: string;
  thickness: number;
  opacity: number;
};

export type FreehandAnnotation = Base & {
  kind: "freehand";
  points: Point[];
  color: string;
  width: number;
  opacity: number;
};

export type RectAnnotation = Base & {
  kind: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  stroke: string;
  fill: string | null;
  strokeWidth: number;
  opacity: number;
};

export type CircleAnnotation = Base & {
  kind: "circle";
  x: number;
  y: number;
  w: number;
  h: number;
  stroke: string;
  fill: string | null;
  strokeWidth: number;
  opacity: number;
};

export type ArrowAnnotation = Base & {
  kind: "arrow";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  strokeWidth: number;
  opacity: number;
};

export type LineAnnotation = Base & {
  kind: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  strokeWidth: number;
  opacity: number;
};

export type TextAnnotation = Base & {
  kind: "text";
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  fontSize: number; // in page units (0..1 relative to page height * 1000 convention handled at render)
  color: string;
  background: string;
};

export type CommentAnnotation = Base & {
  kind: "comment";
  x: number;
  y: number;
  text: string;
  color: string;
};

export type Annotation =
  | HighlightAnnotation
  | UnderlineAnnotation
  | StrikethroughAnnotation
  | FreehandAnnotation
  | RectAnnotation
  | CircleAnnotation
  | ArrowAnnotation
  | LineAnnotation
  | TextAnnotation
  | CommentAnnotation;

export type ToolSettings = {
  color: string;
  fill: string | null;
  strokeWidth: number;
  opacity: number;
  fontSize: number;
};

export type Status = "empty" | "loading" | "ready" | "processing" | "success" | "error";
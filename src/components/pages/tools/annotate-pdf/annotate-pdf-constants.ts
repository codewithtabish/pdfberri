// src/components/pages/tools/annotate-pdf/annotate-pdf-constants.ts
import type { ToolId, ToolSettings } from "./annotate-pdf-types";

export const DEFAULT_SETTINGS: ToolSettings = {
  color: "#ffd54a",
  fill: null,
  strokeWidth: 2,
  opacity: 0.85,
  fontSize: 14,
};

export const TOOL_LIST: { id: ToolId; label: string }[] = [
  { id: "select", label: "Select" },
  { id: "hand", label: "Pan" },
  { id: "highlight", label: "Highlight" },
  { id: "underline", label: "Underline" },
  { id: "strikethrough", label: "Strikethrough" },
  { id: "pen", label: "Pen" },
  { id: "eraser", label: "Eraser" },
  { id: "text", label: "Text" },
  { id: "comment", label: "Comment" },
  { id: "rect", label: "Rectangle" },
  { id: "circle", label: "Circle" },
  { id: "arrow", label: "Arrow" },
  { id: "line", label: "Line" },
];

export const PALETTE = [
  "#ffd54a", // yellow
  "#7dd39a", // green
  "#7ab8f5", // blue
  "#f59ab8", // pink
  "#f78b4a", // orange
  "#b58cf0", // purple
  "#1f2937", // near-black
  "#ffffff", // white
];

export const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 3;
export const ZOOM_STEP = 0.15;
export const HISTORY_LIMIT = 100;
export const CMAP_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/cmaps/";
export const WORKER_SRC = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.worker.min.mjs`;
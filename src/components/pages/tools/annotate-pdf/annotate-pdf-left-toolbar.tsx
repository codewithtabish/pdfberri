"use client";
// src/components/pages/tools/annotate-pdf/annotate-pdf-left-toolbar.tsx
import {
  ArrowShapeIcon,
  CircleShapeIcon,
  CommentIcon,
  CursorIcon,
  EraserIcon,
  HandIcon,
  HighlighterIcon,
  LineShapeIcon,
  PenIcon,
  RectangleIcon,
  StrikethroughIcon,
  TextIcon,
  UnderlineIcon,
} from "@/components/general/icons/pdf-icons";
import type { ToolId } from "./annotate-pdf-types";

const TOOLS: { id: ToolId; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "select", label: "Select", Icon: CursorIcon },
  { id: "hand", label: "Pan", Icon: HandIcon },
  { id: "highlight", label: "Highlight", Icon: HighlighterIcon },
  { id: "underline", label: "Underline", Icon: UnderlineIcon },
  { id: "strikethrough", label: "Strikethrough", Icon: StrikethroughIcon },
  { id: "pen", label: "Pen", Icon: PenIcon },
  { id: "eraser", label: "Eraser", Icon: EraserIcon },
  { id: "text", label: "Text", Icon: TextIcon },
  { id: "comment", label: "Comment", Icon: CommentIcon },
  { id: "rect", label: "Rectangle", Icon: RectangleIcon },
  { id: "circle", label: "Circle", Icon: CircleShapeIcon },
  { id: "arrow", label: "Arrow", Icon: ArrowShapeIcon },
  { id: "line", label: "Line", Icon: LineShapeIcon },
];

export function AnnotatePdfLeftToolbar({
  active,
  onChange,
}: {
  active: ToolId;
  onChange: (id: ToolId) => void;
}) {
  return (
    <nav
      aria-label="Annotation tools"
      className="flex w-14 shrink-0 flex-col items-center gap-1 rounded-xl border border-border bg-card py-2"
    >
      {TOOLS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          title={label}
          aria-label={label}
          aria-pressed={active === id}
          className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
            active === id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </nav>
  );
}
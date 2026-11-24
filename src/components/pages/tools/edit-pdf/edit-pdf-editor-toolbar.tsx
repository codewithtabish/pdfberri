/**
 * PDFBerri – Edit PDF
 * Vertical tool rail (Select, Text, Image, Draw, Highlight, etc.)
 * (No shadcn/ui – pure HTML + Tailwind)
 */

"use client";

import {
  MousePointer2,
  Type,
  Image as ImageIcon,
  Pencil,
  Highlighter,
  Underline,
  Strikethrough,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Eraser,
  PenTool,
  MessageSquare,
  Link2,
  EyeOff,
  Layers,
} from "lucide-react";
import type { ActiveTool } from "./edit-pdf-types";
import type { UseEditPdfReturn } from "./use-edit-pdf";
import { TOOL_LABELS } from "./edit-pdf-constants";
import { cn } from "@/lib/utils";

const TOOLS: {
  id: ActiveTool;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "select", icon: MousePointer2 },
  { id: "text", icon: Type },
  { id: "image", icon: ImageIcon },
  { id: "draw", icon: Pencil },
  { id: "highlight", icon: Highlighter },
  { id: "underline", icon: Underline },
  { id: "strikethrough", icon: Strikethrough },
  { id: "rectangle", icon: Square },
  { id: "circle", icon: Circle },
  { id: "line", icon: Minus },
  { id: "arrow", icon: ArrowRight },
  { id: "whiteout", icon: Eraser },
  { id: "sign", icon: PenTool },
  { id: "comment", icon: MessageSquare },
  { id: "link", icon: Link2 },
  { id: "redact", icon: EyeOff },
  { id: "pages", icon: Layers },
];

interface EditPdfEditorToolbarProps {
  editor: UseEditPdfReturn;
  className?: string;
}

export function EditPdfEditorToolbar({
  editor,
  className,
}: EditPdfEditorToolbarProps) {
  const { state, setTool } = editor;
  const active = state.selection.tool;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl border bg-card p-1.5 shadow-sm",
        className
      )}
      role="toolbar"
      aria-label="Editing tools"
    >
      {TOOLS.map(({ id, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTool(id)}
            aria-label={TOOL_LABELS[id]}
            aria-pressed={isActive}
            title={TOOL_LABELS[id]}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              isActive && "bg-primary/10 text-primary"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
// src/components/pages/tools/word-to-pdf/word-to-pdf-button.tsx

import type { ButtonHTMLAttributes } from "react";

import { joinClasses } from "./word-to-pdf-utils";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "border border-border bg-card text-foreground hover:bg-muted",
  danger:
    "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
};

const SIZES: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

interface WordButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function WordButton({
  variant = "secondary",
  size = "md",
  type = "button",
  className,
  ...props
}: WordButtonProps) {
  return (
    <button
      type={type}
      className={joinClasses(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    />
  );
}

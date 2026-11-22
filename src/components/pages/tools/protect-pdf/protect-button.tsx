import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ProtectButtonVariant = "primary" | "outline" | "danger" | "ghost";
type ProtectButtonSize = "md" | "lg" | "icon";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px motion-reduce:transition-none";

const VARIANTS: Record<ProtectButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
  outline: "border border-border bg-card text-foreground hover:bg-muted",
  danger: "border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10",
  ghost: "text-foreground hover:bg-muted",
};

const SIZES: Record<ProtectButtonSize, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "size-10",
};

interface ClassOptions {
  variant?: ProtectButtonVariant;
  size?: ProtectButtonSize;
  className?: string;
}

export function protectButtonClasses({ variant = "primary", size = "md", className }: ClassOptions = {}) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

type ProtectButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Omit<ClassOptions, "className">;

export function ProtectButton({ variant, size, className, type = "button", ...props }: ProtectButtonProps) {
  return <button type={type} className={protectButtonClasses({ variant, size, className })} {...props} />;
}
"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/general/icons/pdf-icons";
import { cn } from "@/lib/utils";

interface ProtectPasswordInputProps {
  id: string;
  label: string;
  hideLabel?: boolean;
  value: string;
  placeholder: string;
  disabled?: boolean;
  invalid?: boolean;
  errorMessage?: string | null;
  autoComplete: "new-password" | "current-password";
  onChange: (value: string) => void;
}

export function ProtectPasswordInput({
  id,
  label,
  hideLabel = false,
  value,
  placeholder,
  disabled = false,
  invalid = false,
  errorMessage = null,
  autoComplete,
  onChange,
}: ProtectPasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;
  const hasError = invalid && Boolean(errorMessage);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={cn("text-sm font-semibold text-foreground", hideLabel && "sr-only")}>
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={invalid || undefined}
          aria-describedby={hasError ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-11 w-full rounded-xl border bg-background pr-12 pl-3.5 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none",
            invalid ? "border-destructive" : "border-border hover:border-primary/40"
          )}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {visible ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
        </button>
      </div>

      <div aria-live="polite">
        {hasError ? (
          <p id={errorId} className="text-xs font-medium text-destructive">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
// src/components/pages/tools/pdf-to-word/pdf-to-word-password-form.tsx
"use client";

import { useId, useState, type FormEvent } from "react";
import { LockIcon } from "@/components/general/icons/pdf-icons";
import { Button } from "@/components/ui/button";

interface Props {
  fileName: string;
  incorrect: boolean;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export function PdfToWordPasswordForm({
  fileName,
  incorrect,
  onSubmit,
  onCancel,
}: Props) {
  const id = useId();
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (password) onSubmit(password);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full min-h-72 flex-col justify-center gap-4 rounded-xl border-2 border-dashed border-primary/40 p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LockIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-bold">This PDF is password protected</h3>
          <p className="truncate text-sm text-muted-foreground">{fileName}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={id} className="text-sm font-medium">
          Document password
        </label>
        <input
          id={id}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
          autoFocus
          aria-invalid={incorrect}
          aria-describedby={`${id}-help`}
          className="h-11 w-full rounded-lg border border-input bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {incorrect && (
          <p role="alert" className="text-sm text-destructive">
            That password is incorrect. Please try again.
          </p>
        )}
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          Only enter a password if you are authorized to open this document.
          PDFBerri cannot bypass passwords, and the password stays in your
          browser.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={!password} className="font-semibold">
          Unlock and continue
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Choose another PDF
        </Button>
      </div>
    </form>
  );
}
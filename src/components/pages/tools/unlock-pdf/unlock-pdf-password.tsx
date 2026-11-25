"use client";

import { useState } from "react";
import { LockIcon, EyeIcon, EyeOffIcon, LoaderIcon, AlertCircleIcon } from "@/components/general/icons/pdf-icons";

interface UnlockPdfPasswordProps {
  onSubmit: (password: string) => void;
  isProcessing: boolean;
  error: string | null;
}

export function UnlockPdfPassword({ onSubmit, isProcessing, error }: UnlockPdfPasswordProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isProcessing) return;
    onSubmit(password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="space-y-1.5">
        <label htmlFor="unlock-pdf-password" className="flex items-center gap-2 text-sm font-semibold">
          <LockIcon className="h-4 w-4" />
          Enter PDF Password
        </label>
        <p className="text-xs text-muted-foreground">Enter the password used to open this document.</p>
      </div>

      <div className="relative">
        <input
          id="unlock-pdf-password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password..."
          disabled={isProcessing}
          autoComplete="off"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircleIcon className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!password || isProcessing}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <LoaderIcon className="h-5 w-5 animate-spin motion-reduce:animate-none" />
            Unlocking PDF...
          </>
        ) : (
          <>
            <LockIcon className="h-5 w-5" />
            Unlock PDF
          </>
        )}
      </button>
    </form>
  );
}
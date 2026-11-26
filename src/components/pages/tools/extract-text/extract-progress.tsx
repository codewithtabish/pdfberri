"use client";

import type { ExtractProgress } from "./extract-types";

interface Props {
  progress: ExtractProgress;
  onCancel: () => void;
}

export function ExtractProgressUI({ progress, onCancel }: Props) {
  return (
    <div className="flex flex-col gap-4 p-6 border border-border rounded-xl bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Extracting text from your PDF...</h3>
          <p className="text-sm text-muted-foreground">{progress.message}</p>
        </div>
        <span className="text-2xl font-bold text-primary">{progress.percent}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress.percent}%` }} />
      </div>
      <div className="flex justify-end">
        <button onClick={onCancel} className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors">
          Cancel Processing
        </button>
      </div>
    </div>
  );
}
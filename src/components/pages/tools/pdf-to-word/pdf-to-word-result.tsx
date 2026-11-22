// src/components/pages/tools/pdf-to-word/pdf-to-word-result.tsx
"use client";

import { useEffect, useState } from "react";
import {
  CheckIcon,
  DownloadIcon,
  InfoIcon,
  RefreshIcon,
} from "@/components/general/icons/pdf-icons";
import { Button } from "@/components/ui/button";
import type { ConversionResult } from "./pdf-to-word-types";
import { formatBytes, pluralize } from "./pdf-to-word-utils";

interface Props {
  originalName: string;
  result: ConversionResult;
  onReset: () => void;
}

export function PdfToWordResult({ originalName, result, onReset }: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(result.blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [result.blob]);

  const download = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const { stats } = result;

  return (
    <div className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckIcon className="size-8" />
        </span>
        <div className="min-w-0 space-y-1">
          <h3 className="text-xl font-bold">Your Word document is ready.</h3>
          <dl className="space-y-0.5 text-sm">
            <div className="flex gap-1">
              <dt className="font-semibold">Original:</dt>
              <dd className="truncate">{originalName}</dd>
            </div>
            <div className="flex gap-1">
              <dt className="font-semibold">Converted:</dt>
              <dd className="truncate">{result.fileName}</dd>
            </div>
            <div className="flex gap-1">
              <dt className="font-semibold">Size:</dt>
              <dd>
                {formatBytes(result.size)} · {stats.pages}{" "}
                {pluralize(stats.pages, "page")} read
                {stats.tables > 0 &&
                  ` · ${stats.tables} ${pluralize(stats.tables, "table")}`}
                {stats.images > 0 &&
                  ` · ${stats.images} ${pluralize(stats.images, "image")}`}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <ul
          role="note"
          className="space-y-1.5 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground"
        >
          {result.warnings.map((warning) => (
            <li key={warning} className="flex items-start gap-2">
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              {warning}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          size="lg"
          onClick={download}
          disabled={!url}
          className="flex-1 font-semibold"
        >
          <DownloadIcon className="size-5" />
          Download Word Document
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={onReset}
          className="flex-1 font-semibold"
        >
          <RefreshIcon className="size-5" />
          Convert another PDF
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Please review the document in Word. Layout, fonts and recognized text
        can differ from the original PDF.
      </p>
    </div>
  );
}
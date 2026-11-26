"use client";

import { CheckCircleIcon, DownloadIcon, RefreshIcon } from "@/components/general/icons/pdf-icons";
import { formatBytes } from "./powerpoint-to-pdf-utils";
import { PowerPointToPdfPreview } from "./powerpoint-to-pdf-preview";

interface Props {
  blob: Blob;
  fileName: string;
  slideCount: number;
  onDownload: () => void;
  onReset: () => void;
}

export function PowerPointToPdfResult({ blob, fileName, slideCount, onDownload, onReset }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/50 rounded-xl gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
            <CheckCircleIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Your PDF is ready!</h3>
            <p className="text-sm text-muted-foreground">
              {fileName} • {slideCount > 0 ? `${slideCount} Slides • ` : ""}{formatBytes(blob.size)}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={onReset}
            className="flex-1 md:flex-none px-4 py-2 text-sm font-semibold text-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            <RefreshIcon className="w-4 h-4" />
            Convert Another
          </button>
          <button
            onClick={onDownload}
            className="flex-1 md:flex-none bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <DownloadIcon className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="p-4 border border-border rounded-xl bg-card">
            <h4 className="font-semibold text-sm mb-2">Conversion Details</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong className="text-foreground">Format:</strong> PDF</li>
              {slideCount > 0 && <li><strong className="text-foreground">Slides:</strong> {slideCount}</li>}
              <li><strong className="text-foreground">Size:</strong> {formatBytes(blob.size)}</li>
            </ul>
          </div>
        </div>
        <div className="md:col-span-2">
          <PowerPointToPdfPreview pdfBlob={blob} />
        </div>
      </div>
    </div>
  );
}
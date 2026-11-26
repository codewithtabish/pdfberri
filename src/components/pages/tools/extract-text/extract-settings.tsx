"use client";

import { useState } from "react";

interface Props {
  onProcess: (options: any, pageRange: string) => void;
}

export function ExtractSettings({ onProcess }: Props) {
  const [pageMode, setPageMode] = useState<"all" | "custom">("all");
  const [customRange, setCustomRange] = useState("");
  
  const [preserveLineBreaks, setPreserveLineBreaks] = useState(true);
  const [preservePageSeparation, setPreservePageSeparation] = useState(true);
  const [includePageNumbers, setIncludePageNumbers] = useState(true);

  const handleSubmit = () => {
    onProcess(
      { preserveLineBreaks, preservePageSeparation, includePageNumbers },
      pageMode === "custom" ? customRange : ""
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 border border-border rounded-xl bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Page Selection */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground">Page Selection</h3>
          <label className="flex items-center gap-2 text-sm">
            <input 
              type="radio" 
              checked={pageMode === "all"} 
              onChange={() => setPageMode("all")} 
              className="text-primary focus:ring-primary"
            />
            All pages
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input 
              type="radio" 
              checked={pageMode === "custom"} 
              onChange={() => setPageMode("custom")}
              className="text-primary focus:ring-primary" 
            />
            Selected page range
          </label>
          {pageMode === "custom" && (
            <input
              type="text"
              placeholder="e.g. 1-5, 8, 12-15"
              value={customRange}
              onChange={(e) => setCustomRange(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm mt-1"
            />
          )}
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground">Extraction Options</h3>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={preserveLineBreaks} onChange={(e) => setPreserveLineBreaks(e.target.checked)} className="rounded text-primary focus:ring-primary" />
            Preserve paragraphs and line breaks
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={preservePageSeparation} onChange={(e) => setPreservePageSeparation(e.target.checked)} className="rounded text-primary focus:ring-primary" />
            Preserve page separation
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includePageNumbers} onChange={(e) => setIncludePageNumbers(e.target.checked)} className="rounded text-primary focus:ring-primary" />
            Include page numbers as separators
          </label>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full md:w-auto self-end flex justify-center items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Extract Text
      </button>
    </div>
  );
}
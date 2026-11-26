"use client";

interface Props {
  fileName: string;
  blob: Blob;
  languages: string[];
  onReset: () => void;
}

export function OcrResult({ fileName, blob, languages, onReset }: Props) {
  const handleDownload = () => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 p-8 border border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10 rounded-xl items-center text-center">
      <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/50 dark:text-green-400">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground">Your PDF is now searchable!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The document has been successfully processed with OCR.
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
        <span>Languages: {languages.join(", ").toUpperCase()}</span>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Download Searchable PDF
        </button>
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Process Another PDF
        </button>
      </div>
    </div>
  );
}
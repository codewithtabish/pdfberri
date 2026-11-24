import type { DocumentState } from './add-page-numbers-types';

interface Props {
  doc: DocumentState;
  onRemove: () => void;
}

export function AddPageNumbersFileInfo({ doc, onRemove }: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 text-primary font-bold text-xs">PDF</div>
        <div>
          <p className="text-sm font-medium">{doc.filename}</p>
          <p className="text-xs text-muted-foreground">{(doc.fileSize / 1024).toFixed(0)} KB • {doc.pageCount} pages</p>
        </div>
      </div>
      <button onClick={onRemove} className="text-sm text-destructive hover:underline">Remove File</button>
    </div>
  );
}
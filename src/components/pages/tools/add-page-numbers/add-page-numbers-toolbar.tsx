interface Props {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function AddPageNumbersToolbar({ currentPage, totalPages, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-2 mt-4">
      <button onClick={onPrev} disabled={currentPage <= 1} className="px-4 py-1.5 text-sm hover:bg-accent rounded disabled:opacity-50">
        &larr; Prev
      </button>
      <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
      <button onClick={onNext} disabled={currentPage >= totalPages} className="px-4 py-1.5 text-sm hover:bg-accent rounded disabled:opacity-50">
        Next &rarr;
      </button>
    </div>
  );
}
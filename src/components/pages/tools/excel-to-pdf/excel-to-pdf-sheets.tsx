'use client';

import type { SheetInfo } from './excel-to-pdf-types';

interface Props {
  sheets: SheetInfo[];
  selected: Set<number>;
  includeHiddenSheets: boolean;
  disabled: boolean;
  onToggle: (id: number) => void;
  onSelectAll: () => void;
  onClear: () => void;
}

export function ExcelSheets({ sheets, selected, includeHiddenSheets, disabled, onToggle, onSelectAll, onClear }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Worksheets</h3>
        <span className="text-xs text-muted-foreground">
          {selected.size} of {sheets.length} selected
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSelectAll}
          disabled={disabled}
          className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50"
        >
          Select all
        </button>
        <button
          onClick={onClear}
          disabled={disabled}
          className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
        {sheets.map((s) => {
          const unavailable = !!s.skippedReason || (s.hidden && !includeHiddenSheets);
          return (
            <li key={s.id}>
              <label
                className={`flex items-start gap-2 rounded-lg border border-border px-3 py-2 text-sm ${
                  unavailable ? 'opacity-60' : 'cursor-pointer hover:bg-muted/50'
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-primary"
                  checked={selected.has(s.id)}
                  disabled={disabled || unavailable}
                  onChange={() => onToggle(s.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium text-foreground" title={s.name}>
                      {s.name}
                    </span>
                    {s.hidden && (
                      <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        Hidden
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {s.skippedReason
                      ? s.skippedReason
                      : s.rowCount === 0
                        ? 'Empty'
                        : `${s.rowCount.toLocaleString()} rows × ${s.colCount} columns`}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {sheets.some((s) => s.hidden) && !includeHiddenSheets && (
        <p className="text-xs text-muted-foreground">
          Hidden worksheets are not included. Turn on &quot;Include hidden worksheets&quot; in the settings to convert them.
        </p>
      )}
    </div>
  );
}
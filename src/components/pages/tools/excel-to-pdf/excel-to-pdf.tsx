'use client';

import {
  AlertCircleIcon,
  CheckCircleIcon,
  DownloadIcon,
  ExcelIcon,
  LoaderIcon,
} from '@/components/general/icons/pdf-icons';
import { ExcelPopularTools } from './excel-to-pdf-popular-tools';
import { ExcelPreview } from './excel-to-pdf-preview';
import { ExcelSettings } from './excel-to-pdf-settings';
import { ExcelSheets } from './excel-to-pdf-sheets';
import { ExcelUpload } from './excel-to-pdf-upload';
import { useExcelToPdf } from './use-excel-to-pdf';
import { formatBytes, safePdfName } from './excel-to-pdf-utils';

export function ExcelToPdf() {
  const { state, actions } = useExcelToPdf();

  const hasFile = state.stage === 'ready' || state.stage === 'converting' || state.stage === 'done';
  const busy = state.stage === 'converting';

  const selectedInfos = state.sheets.filter((s) => state.selected.has(s.id));
  const hiddenRowTotal = selectedInfos.reduce((n, s) => n + s.hiddenRowCount, 0);
  const hiddenColTotal = selectedInfos.reduce((n, s) => n + s.hiddenColCount, 0);
  const hasPrintSettings = state.sheets.some((s) => s.hasPrintSettings);
  const hasHiddenSheets = state.sheets.some((s) => s.hidden);

  const allWarnings = [...state.warnings, ...(state.result?.warnings ?? [])];

  const download = () => {
    if (!state.result) return;
    const a = document.createElement('a');
    a.href = state.result.url;
    a.download = safePdfName(state.fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Excel to PDF Converter</h1>
        <p className="mt-2 text-muted-foreground">
          Convert your Excel worksheets to a PDF with real text, formatting and page layout. Everything happens in your browser.
        </p>
      </div>

      {state.error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive">
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      {!hasFile && (
        <ExcelUpload onFile={actions.selectFile} onCancel={actions.reset} isParsing={state.stage === 'parsing'} />
      )}

      {hasFile && (
        <>
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-md bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <ExcelIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground" title={state.fileName ?? ''}>
                  {state.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(state.fileSize)} • {state.sheets.length} worksheet{state.sheets.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <button
              onClick={actions.reset}
              disabled={busy}
              className="text-sm font-medium text-destructive hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          </div>

          {allWarnings.length > 0 && (
            <div className="rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700/40 dark:bg-amber-900/10 dark:text-amber-200">
              <p className="mb-1 font-semibold">Please note</p>
              <ul className="list-disc space-y-1 pl-5">
                {allWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-4 md:p-6 lg:flex-row">
            <div className="flex flex-col gap-6 lg:w-80 lg:shrink-0">
              <ExcelSheets
                sheets={state.sheets}
                selected={state.selected}
                includeHiddenSheets={state.settings.includeHiddenSheets}
                disabled={busy}
                onToggle={actions.toggleSheet}
                onSelectAll={actions.selectAll}
                onClear={actions.clearSelection}
              />

              <div className="border-t border-border pt-6">
                <ExcelSettings
                  settings={state.settings}
                  disabled={busy}
                  hasPrintSettings={hasPrintSettings}
                  hiddenRowTotal={hiddenRowTotal}
                  hiddenColTotal={hiddenColTotal}
                  hasHiddenSheets={hasHiddenSheets}
                  onChange={actions.updateSettings}
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-6">
                {state.stage === 'converting' && state.progress && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-foreground">
                        <LoaderIcon className="h-4 w-4 animate-spin text-primary" />
                        {state.progress.message}
                      </span>
                      <span className="font-semibold text-primary">{state.progress.percent}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${state.progress.percent}%` }}
                      />
                    </div>
                    <button
                      onClick={actions.cancel}
                      className="self-end text-sm font-medium text-muted-foreground hover:text-destructive"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {state.stage === 'ready' && (
                  <button
                    onClick={actions.convert}
                    disabled={state.selected.size === 0}
                    className="w-full rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
                  >
                    Convert to PDF
                  </button>
                )}

                {state.stage === 'done' && state.result && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                      <CheckCircleIcon className="h-6 w-6 shrink-0 text-green-600" />
                      <div className="text-sm">
                        <p className="font-semibold text-foreground">Your PDF is ready</p>
                        <p className="text-xs text-muted-foreground">
                          {state.result.pageCount} page{state.result.pageCount === 1 ? '' : 's'} • {formatBytes(state.result.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={download}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                    >
                      <DownloadIcon className="h-5 w-5" />
                      Download PDF
                    </button>
                    <button
                      onClick={actions.reset}
                      className="text-center text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      Convert another file
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              {state.result ? (
                <ExcelPreview url={state.result.url} pageSheets={state.result.pageSheets} />
              ) : (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
                  <p className="font-medium text-foreground">PDF preview</p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Choose your worksheets and settings, then click &quot;Convert to PDF&quot;. The preview shows the real PDF that you will download.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ExcelPopularTools />
    </div>
  );
}
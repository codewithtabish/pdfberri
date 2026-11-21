"use client";

import { cn } from "@/lib/utils";
import { SPLIT_UI } from "./split-constants";
import { SplitEqualParts } from "./split-equal-parts";
import { SplitErrorState } from "./split-error";
import { SplitFileCard } from "./split-file-card";
import { SplitMethodSelector } from "./split-method-selector";
import { SplitOutputPreview } from "./split-output-preview";
import { SplitPageGrid } from "./split-page-grid";
import { SplitPrivacyNote } from "./split-privacy-note";
import { SplitProgressPanel } from "./split-progress";
import { SplitRangeEditor } from "./split-range-editor";
import { SplitSuccess } from "./split-success";
import { SplitToolbar } from "./split-toolbar";
import { SplitUploadZone } from "./split-upload-zone";
import { useSplitWorkspace } from "./use-split-workspace";
import { SplitIcon } from "@/components/general/icons/pdf-icons";

export function SplitWorkspace() {
  const w = useSplitWorkspace();
  const processing = w.status === "processing";

  const announcement =
    w.status === "done"
      ? "Your PDFs are ready."
      : processing
        ? "Splitting your PDF."
        : w.error
          ? w.error
          : "";

  return (
    <div className="space-y-4">
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {!w.doc || !w.pdf ? (
        <SplitUploadZone loading={w.status === "loading"} error={w.error} onFile={w.loadFile} />
      ) : w.status === "done" ? (
        <SplitSuccess
          outputs={w.outputs}
          zipping={w.zipping}
          error={w.error}
          notice={w.notice}
          onDownload={w.downloadOne}
          onDownloadAll={w.downloadAll}
          onEditAgain={w.backToEditing}
          onSplitAnother={w.removeFile}
        />
      ) : (
        <section aria-label="Split PDF workspace" className={cn(SPLIT_UI.card, "p-3 sm:p-5")}>
          <SplitFileCard doc={w.doc} disabled={processing} onReplace={w.loadFile} onRemove={w.removeFile} />

          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="min-w-0 space-y-3">
              <SplitPageGrid
                key={w.doc.id}
                pdf={w.pdf}
                pageCount={w.doc.pageCount}
                selected={w.selected}
                interactive={w.method === "selected-pages" && !processing}
                assignments={w.assignments}
                onToggle={w.togglePage}
              />
              <SplitToolbar
                pageCount={w.doc.pageCount}
                selectedCount={w.selected.size}
                interactive={w.method === "selected-pages"}
                disabled={processing}
                onSelectAll={w.selectAll}
                onClear={w.clearSelection}
              />
            </div>

            <fieldset disabled={processing} className="min-w-0 space-y-5 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <SplitMethodSelector value={w.method} onChange={w.setMethod} />

              {w.method === "page-ranges" ? (
                <SplitRangeEditor
                  ranges={w.ranges}
                  pageCount={w.doc.pageCount}
                  onAdd={w.addRange}
                  onChange={w.updateRange}
                  onRemove={w.removeRange}
                />
              ) : null}
              {w.method === "equal-parts" ? (
                <SplitEqualParts value={w.equalParts} pageCount={w.doc.pageCount} onChange={w.setEqualParts} />
              ) : null}

              <SplitOutputPreview plan={w.planResult} />

              {w.error ? <SplitErrorState message={w.error} onRetry={w.planResult?.ok ? w.startSplit : undefined} /> : null}

              {processing ? (
                <SplitProgressPanel progress={w.progress} onCancel={w.cancelSplit} />
              ) : (
                <button
                  type="button"
                  onClick={w.startSplit}
                  disabled={!w.planResult?.ok}
                  className={cn(SPLIT_UI.primaryButton, "w-full")}
                >
                  <SplitIcon className="size-5" />
                  Split PDF
                </button>
              )}
            </fieldset>
          </div>
        </section>
      )}

      <SplitPrivacyNote />
    </div>
  );
}
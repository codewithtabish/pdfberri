"use client";

import { useMergeWorkspace } from "./use-merge-workspace";
import { MergeError, MergeIssues } from "./merge-error";
import { MergePrivacyNote } from "./merge-privacy-note";
import { MergeProgressView } from "./merge-progress";
import { MergeSuccess } from "./merge-success";
import { MergeToolbar } from "./merge-toolbar";
import { MergeUploadZone } from "./merge-upload-zone";
import { MergeFileList } from "./merge-file-list";

export function MergeWorkspace() {
  const ws = useMergeWorkspace();
  const hasFiles = ws.files.length > 0;

  return (
    <section aria-label="Merge PDF tool" className="mx-auto w-full max-w-5xl">
      {/* Screen-reader status announcements */}
      <p role="status" aria-live="polite" className="sr-only">
        {ws.announcement}
      </p>

      <div className="rounded-2xl border border-border bg-card p-3 sm:p-5">
        {ws.phase === "processing" && (
          <MergeProgressView progress={ws.progress} onCancel={ws.cancelMerge} />
        )}

        {ws.phase === "success" && ws.result && (
          <MergeSuccess result={ws.result} onMergeMore={ws.reset} />
        )}

        {ws.phase === "error" && (
          <MergeError
            message={ws.errorMessage ?? "Something went wrong while merging."}
            onRetry={ws.startMerge}
            onBack={ws.backToEditing}
          />
        )}

        {ws.phase === "idle" && (
          <div className="flex flex-col gap-4">
            <MergeUploadZone
              compact={hasFiles}
              disabled={ws.isScreening}
              onFiles={ws.addFiles}
            />

            <MergeIssues
              issues={ws.issues}
              onDismiss={ws.dismissIssue}
              onDismissAll={ws.dismissAllIssues}
            />

            {hasFiles && (
              <>
                <MergeFileList
                  files={ws.files}
                  onMove={ws.moveFile}
                  onRemove={ws.removeFile}
                />
                <MergeToolbar
                  fileCount={ws.files.length}
                  totalPages={ws.totalPages}
                  totalSize={ws.totalSize}
                  isInspecting={ws.isInspecting}
                  outputName={ws.outputName}
                  canMerge={ws.canMerge}
                  onOutputNameChange={ws.setOutputName}
                  onOutputNameCommit={ws.commitOutputName}
                  onMerge={ws.startMerge}
                  onClear={ws.clearFiles}
                />
                <MergePrivacyNote variant="inline" />
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
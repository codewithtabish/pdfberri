"use client";

import { useCallback, useRef, type ChangeEvent } from "react";
import { ACCEPT_ATTRIBUTE } from "./jpg-to-pdf-config";
import { JpgToPdfError } from "./jpg-to-pdf-error";
import { JpgToPdfGallery } from "./jpg-to-pdf-gallery";
import { JpgToPdfPreview } from "./jpg-to-pdf-preview";
import { JpgToPdfProgress } from "./jpg-to-pdf-progress";
import { JpgToPdfResults } from "./jpg-to-pdf-results";
import { JpgToPdfSettings } from "./jpg-to-pdf-settings";
import { JpgToPdfUploadZone } from "./jpg-to-pdf-upload-zone";
import { useJpgToPdfWorkspace } from "./use-jpg-to-pdf-workspace";

export function JpgToPdfWorkspace() {
  const {
    state,
    addFiles,
    convert,
    cancel,
    download,
    removeImage,
    clearImages,
    reorderImages,
    moveImage,
    rotateImage,
    updateSettings,
    dismissIssues,
  } = useJpgToPdfWorkspace();

  const inputRef = useRef<HTMLInputElement>(null);
  const { images, settings, status, issues, isReading } = state;
  const isConverting = status.phase === "converting";
  const locked = isConverting || isReading;
  const hasImages = images.length > 0;

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) void addFiles(Array.from(files));
      event.target.value = "";
    },
    [addFiles],
  );

  const handleFiles = useCallback((files: FileList) => void addFiles(Array.from(files)), [addFiles]);

  return (
    <section aria-label="JPG to PDF converter" className="flex flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTRIBUTE}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-label="Choose images to convert"
      />

      {issues.length > 0 ? (
        <JpgToPdfError
          title={issues.length === 1 ? "1 file could not be added" : `${issues.length} files could not be added`}
          issues={issues}
          onDismiss={dismissIssues}
        />
      ) : null}

      {status.phase === "error" ? (
        <JpgToPdfError title="The PDF could not be created" message={status.message} />
      ) : null}

      {hasImages ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <JpgToPdfUploadZone
              variant="compact"
              onFiles={handleFiles}
              onOpenPicker={openPicker}
              disabled={locked}
              isReading={isReading}
            />
            <JpgToPdfGallery
              images={images}
              disabled={locked}
              onAddMore={openPicker}
              onClear={clearImages}
              onRemove={removeImage}
              onRotate={rotateImage}
              onMove={moveImage}
              onReorder={reorderImages}
            />
            <JpgToPdfPreview images={images} settings={settings} />
          </div>

          <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
            <JpgToPdfSettings
              settings={settings}
              imageCount={images.length}
              disabled={locked}
              isConverting={isConverting}
              onChange={updateSettings}
              onConvert={() => void convert()}
            />
            {status.phase === "converting" ? (
              <JpgToPdfProgress progress={status.progress} onCancel={cancel} />
            ) : null}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card p-3 shadow-sm sm:p-4">
          <JpgToPdfUploadZone
            variant="hero"
            onFiles={handleFiles}
            onOpenPicker={openPicker}
            disabled={locked}
            isReading={isReading}
          />
        </div>
      )}

      {status.phase === "success" ? (
        <JpgToPdfResults result={status.result} onDownload={download} onStartOver={clearImages} />
      ) : null}
    </section>
  );
}
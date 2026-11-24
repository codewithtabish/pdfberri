'use client';
import React, { useState } from 'react';
import { useAddPageNumbers } from './use-add-page-numbers';
import { AddPageNumbersUpload } from './add-page-numbers-upload';
import { AddPageNumbersFileInfo } from './add-page-numbers-file-info';
import { AddPageNumbersSettings } from './add-page-numbers-settings';
import { AddPageNumbersPreview } from './add-page-numbers-preview';
import { AddPageNumbersToolbar } from './add-page-numbers-toolbar';
import { AddPageNumbersResult } from './add-page-numbers-result';

export function AddPageNumbersWorkspace() {
  const { doc, config, setConfig, status, error, output, progress, loadFile, generate, download, reset } = useAddPageNumbers();
  const [previewPage, setPreviewPage] = useState(1);

  if (!doc || status === 'idle' || status === 'loading') {
    return <AddPageNumbersUpload onFile={loadFile} isLoading={status === 'loading'} error={error} />;
  }

  if (status === 'success' && output) {
    return <AddPageNumbersResult output={output} onDownload={download} onReset={reset} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <AddPageNumbersFileInfo doc={doc} onRemove={reset} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <AddPageNumbersSettings
            config={config}
            onChange={setConfig}
            onGenerate={generate}
            isProcessing={status === 'processing'}
            error={error}
          />
          {status === 'processing' && <p className="text-sm text-center text-muted-foreground mt-2">{progress}</p>}
        </div>

        <div className="flex flex-col items-center">
          <AddPageNumbersPreview
            bytes={doc.bytes}
            pageNumber={previewPage}
            config={config}
            totalSelected={doc.pageCount}
          />
          <div className="w-full max-w-[400px]">
            <AddPageNumbersToolbar
              currentPage={previewPage}
              totalPages={doc.pageCount}
              onPrev={() => setPreviewPage(p => Math.max(1, p - 1))}
              onNext={() => setPreviewPage(p => Math.min(doc.pageCount, p + 1))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
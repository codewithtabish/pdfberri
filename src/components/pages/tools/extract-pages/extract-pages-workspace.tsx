'use client';
import React from 'react';
import { useExtractPages } from './use-extract-pages';
import { ExtractPagesUpload } from './extract-pages-upload';
import { ExtractPagesFileInfo } from './extract-pages-file-info';
import { ExtractPagesToolbar } from './extract-pages-toolbar';
import { ExtractPagesThumbnailGrid } from './extract-pages-thumbnail-grid';
import { ExtractPagesSettings } from './extract-pages-settings';
import { ExtractPagesResult } from './extract-pages-result';

export function ExtractPagesWorkspace() {
  const { doc, selectedIndices, status, error, output, mode, setMode, loadFile, togglePage, setRange, selectAll, clearAll, invert, processExtraction, reset } = useExtractPages();

  if (!doc || status === 'idle' || status === 'loading') {
    return <ExtractPagesUpload onFile={loadFile} isLoading={status === 'loading'} error={error} />;
  }
  
  if (status === 'success' && output) {
    return <ExtractPagesResult output={output} onReset={reset} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <ExtractPagesFileInfo filename={doc.filename} fileSize={doc.fileSize} pageCount={doc.pageCount} onReset={reset} />
      
      <ExtractPagesToolbar 
        selectedCount={selectedIndices.length} total={doc.pageCount} 
        onSelectAll={selectAll} onClear={clearAll} onInvert={invert} onRangeChange={setRange} 
      />

      <ExtractPagesThumbnailGrid bytes={doc.bytes} pageCount={doc.pageCount} selectedIndices={selectedIndices} onToggle={togglePage} />

      <ExtractPagesSettings mode={mode} setMode={setMode} onExtract={processExtraction} disabled={selectedIndices.length === 0 || status === 'processing'} />
      
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}
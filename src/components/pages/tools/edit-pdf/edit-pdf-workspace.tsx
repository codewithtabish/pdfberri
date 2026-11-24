// src/components/pages/tools/edit-pdf/edit-pdf-workspace.tsx
'use client';

import { useEffect, useState } from 'react';
import { useEditPDF } from './use-edit-pdf';
import { EditPdfUpload } from './edit-pdf-upload';
import { EditPdfToolbar } from './edit-pdf-toolbar';
import { EditPdfEditorToolbar } from './edit-pdf-editor-toolbar';
import { EditPdfPageCanvas } from './edit-pdf-page-canvas';
import { EditPdfPageSidebar } from './edit-pdf-page-sidebar';
import { EditPdfPropertiesPanel } from './edit-pdf-properties-panel';
import type { ActiveTool, EditableObject, ImageObject, LinkObject } from './edit-pdf-types';
import { isSafeUrl } from './edit-pdf-utils';
import { EditPdfSignatureDialog } from './edit-pdf-signature-dialog';

export function EditPdfWorkspace() {
  const editor = useEditPDF();
  const { state, pdfDoc } = editor;
  const [sigOpen, setSigOpen] = useState(false);
  const [pendingSigPos, setPendingSigPos] = useState<{ x: number; y: number } | null>(null);
  const [linkPrompt, setLinkPrompt] = useState<{ x: number; y: number } | null>(null);

  /* keyboard */
  useEffect(() => {
    if (!state.document) return;
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); editor.undo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); editor.redo(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && state.selection.objectId && state.selection.pageId) {
        e.preventDefault();
        editor.deleteObject(state.selection.pageId, state.selection.objectId);
      } else if (e.key === 'Escape') editor.setTool('select');
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [state.document, state.selection, editor]);

  if (!state.document) {
    return (
      <EditPdfUpload
        onFile={editor.loadFile}
        isLoading={editor.isLoading}
        error={editor.error?.message ?? null}
      />
    );
  }

  const currentPage =
    state.document.pages.find((p) => p.id === state.selection.pageId) ??
    state.document.pages[0];

  const handlePlace = async (tool: ActiveTool, x: number, y: number) => {
    switch (tool) {
      case 'text': {
        const obj = editor.createText(currentPage.id, x, y);
        editor.addObject(currentPage.id, obj);
        editor.setTool('select');
        break;
      }
      case 'image': {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png,image/jpeg';
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          if (!['image/png', 'image/jpeg'].includes(file.type)) return;
          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result as string;
            const img = new Image();
            img.onload = () => {
              const maxW = currentPage.width / 3;
              const ratio = img.height / img.width;
              const w = Math.min(img.width, maxW);
              const h = w * ratio;
              const obj = editor.createImage(
                currentPage.id, x, y + h, src,
                file.type as 'image/png' | 'image/jpeg', w, h,
              );
              editor.addObject(currentPage.id, obj);
              editor.setTool('select');
            };
            img.src = src;
          };
          reader.readAsDataURL(file);
        };
        input.click();
        break;
      }
      case 'sign':
        setPendingSigPos({ x, y });
        setSigOpen(true);
        break;
      case 'comment': {
        const text = window.prompt('Comment text', 'Comment') ?? 'Comment';
        const obj = editor.createComment(currentPage.id, x, y, text);
        editor.addObject(currentPage.id, obj);
        editor.setTool('select');
        break;
      }
      case 'link':
        setLinkPrompt({ x, y });
        break;
      case 'redact':
        window.alert(
          'Secure redaction is not available in this build. A black box on top of content does not remove the underlying text. This tool is disabled rather than pretending to be secure.',
        );
        editor.setTool('select');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] flex-col gap-2">
      <EditPdfToolbar editor={editor} />

      <div className="flex flex-1 overflow-hidden gap-2">
        <EditPdfPageSidebar editor={editor} />

        <div className="flex flex-1 gap-2 overflow-hidden">
          <EditPdfEditorToolbar editor={editor} className="self-start" />

          <main className="flex-1 overflow-auto rounded-xl border bg-muted/30 p-4">
            {pdfDoc && currentPage && (
              <EditPdfPageCanvas
                pdfDoc={pdfDoc}
                pageState={currentPage}
                zoom={state.viewport.zoom}
                activeTool={state.selection.tool}
                selectedObjectId={state.selection.objectId}
                onSelect={editor.setSelected}
                onPlaceObject={handlePlace}
                onDrawAnnotation={(obj: EditableObject) => {
                  editor.addObject(currentPage.id, obj);
                  editor.setTool('select');
                }}
                onUpdateObject={(id, patch) => editor.updateObject(currentPage.id, id, patch)}
              />
            )}
          </main>

          <EditPdfPropertiesPanel editor={editor} />
        </div>
      </div>

      <EditPdfSignatureDialog
        open={sigOpen}
        onClose={() => { setSigOpen(false); setPendingSigPos(null); }}
        onConfirm={(dataUrl) => {
          setSigOpen(false);
          if (!pendingSigPos) return;
          const obj = editor.createSignature(currentPage.id, pendingSigPos.x, pendingSigPos.y, dataUrl);
          editor.addObject(currentPage.id, obj);
          setPendingSigPos(null);
          editor.setTool('select');
        }}
      />

      <LinkDialog
        open={!!linkPrompt}
        onClose={() => setLinkPrompt(null)}
        onSubmit={(url) => {
          if (!linkPrompt) return;
          if (!isSafeUrl(url)) { window.alert('Only http, https, or mailto URLs are allowed.'); return; }
          const obj = editor.createLink(currentPage.id, linkPrompt.x, linkPrompt.y, 120, 20, url);
          editor.addObject(currentPage.id, obj);
          setLinkPrompt(null);
          editor.setTool('select');
        }}
      />
    </div>
  );
}

function LinkDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (url: string) => void }) {
  const [url, setUrl] = useState('');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-lg bg-card p-4 shadow-xl">
        <h2 className="mb-2 text-lg font-semibold">Add link</h2>
        <input
          autoFocus
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="mb-3 w-full rounded border p-2 text-sm"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded border px-3 py-1 text-sm">Cancel</button>
          <button
            onClick={() => onSubmit(url.trim())}
            disabled={!url.trim()}
            className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50"
          >Add</button>
        </div>
      </div>
    </div>
  );
}
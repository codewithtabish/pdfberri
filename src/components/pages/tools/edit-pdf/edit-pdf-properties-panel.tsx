// src/components/pages/tools/edit-pdf/edit-pdf-properties-panel.tsx
'use client';

import type { UseEditPdfReturn } from './use-edit-pdf';

export function EditPdfPropertiesPanel({ editor }: { editor: UseEditPdfReturn }) {
  const { state } = editor;
  const doc = state.document;
  const page = doc?.pages.find((p) => p.id === state.selection.pageId);
  const selected = page?.objects.find((o) => o.id === state.selection.objectId);
  const pageId = state.selection.pageId;

  if (!doc || !pageId) return null;

  if (!selected) {
    return (
      <aside className="hidden w-64 shrink-0 rounded-xl border bg-card p-4 text-sm text-muted-foreground lg:block">
        Select an object to edit its properties.
      </aside>
    );
  }

  return (
    <aside className="hidden w-64 shrink-0 overflow-y-auto rounded-xl border bg-card p-4 lg:block">
      <h3 className="mb-3 text-sm font-semibold capitalize">{selected.type} properties</h3>

      {selected.type === 'text' && (
        <div className="space-y-3">
          <label className="block text-xs">
            Text
            <textarea
              value={selected.text}
              onChange={(e) => editor.updateObject(pageId, selected.id, { text: e.target.value })}
              className="mt-1 w-full rounded border p-1 text-sm"
              rows={3}
            />
          </label>
          <label className="block text-xs">
            Font size
            <input type="number" min={6} max={144}
              value={selected.fontSize}
              onChange={(e) => editor.updateObject(pageId, selected.id, { fontSize: Number(e.target.value) })}
              className="mt-1 w-full rounded border p-1 text-sm" />
          </label>
          <label className="block text-xs">
            Color
            <input type="color" value={selected.color}
              onChange={(e) => editor.updateObject(pageId, selected.id, { color: e.target.value })}
              className="mt-1 h-8 w-full rounded border" />
          </label>
        </div>
      )}

      {(selected.type === 'image' || selected.type === 'signature') && (
        <p className="text-xs text-muted-foreground">Drag to reposition in a future update.</p>
      )}

      {selected.type === 'link' && (
        <label className="block text-xs">
          URL
          <input type="url" value={selected.url}
            onChange={(e) => editor.updateObject(pageId, selected.id, { url: e.target.value })}
            className="mt-1 w-full rounded border p-1 text-sm" />
        </label>
      )}

      <button
        onClick={() => editor.deleteObject(pageId, selected.id)}
        className="mt-4 rounded bg-destructive px-2 py-1 text-xs text-destructive-foreground"
      >
        Delete object
      </button>
    </aside>
  );
}
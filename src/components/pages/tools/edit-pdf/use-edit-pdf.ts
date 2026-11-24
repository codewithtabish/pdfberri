// src/components/pages/tools/edit-pdf/use-edit-pdf.ts
'use client';

import { useCallback, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type {
  ActiveTool,
  DocumentModel,
  EditPdfState,
  EditableObject,
  EditPdfError,
  PageId,
  PDFPageState,
  TextObject,
  ImageObject,
  AnnotationObject,
  SignatureObject,
  CommentObject,
  LinkObject,
} from './edit-pdf-types';
import { EDIT_PDF_CONFIG } from './edit-pdf-constants';
import { HistoryStack } from './edit-pdf-history';
import { loadPdfDocument, destroyDocument } from './edit-pdf-engine';
import { exportPDF } from './edit-pdf-export';
import { validateFile } from './edit-pdf-validation';
import { uid, downloadBlob } from './edit-pdf-utils';

const initialState: EditPdfState = {
  document: null,
  selection: { tool: 'select', pageId: null, objectId: null },
  viewport: { zoom: 1, fitMode: 'none' },
  export: { status: 'idle', error: null },
};

export interface UseEditPdfReturn {
  state: EditPdfState;
  pdfDoc: PDFDocumentProxy | null;
  isLoading: boolean;
  error: EditPdfError | null;
  canUndo: boolean;
  canRedo: boolean;

  /* document actions */
  loadFile: (file: File) => Promise<void>;
  replaceFile: (file: File) => Promise<void>;
  reset: () => Promise<void>;
  exportDocument: () => Promise<void>;

  /* selection + viewport */
  setTool: (tool: ActiveTool) => void;
  setPage: (pageId: PageId) => void;
  setSelected: (objectId: string | null) => void;
  setZoom: (zoom: number) => void;
  setFitMode: (mode: 'none' | 'width' | 'page') => void;

  /* page operations */
  rotatePage: (pageId: PageId) => void;
  deletePage: (pageId: PageId) => void;
  duplicatePage: (pageId: PageId) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;

  /* object operations */
  addObject: (pageId: PageId, obj: EditableObject) => void;
  updateObject: (pageId: PageId, id: string, patch: Partial<EditableObject>) => void;
  deleteObject: (pageId: PageId, id: string) => void;
  duplicateObject: (pageId: PageId, id: string) => void;

  /* object builders */
  createText: (pageId: PageId, x: number, y: number) => TextObject;
  createImage: (pageId: PageId, x: number, y: number, src: string, mime: 'image/png' | 'image/jpeg', w: number, h: number) => ImageObject;
  createAnnotation: (pageId: PageId, shape: AnnotationObject['shape'], x: number, y: number, w: number, h: number, color?: string) => AnnotationObject;
  createSignature: (pageId: PageId, x: number, y: number, src: string) => SignatureObject;
  createComment: (pageId: PageId, x: number, y: number, text?: string) => CommentObject;
  createLink: (pageId: PageId, x: number, y: number, w: number, h: number, url: string) => LinkObject;

  /* history */
  undo: () => void;
  redo: () => void;
}

export function useEditPDF(): UseEditPdfReturn {
  const [state, setState] = useState<EditPdfState>(initialState);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<EditPdfError | null>(null);
  const [, setHistoryVersion] = useState(0); // Forces re-render for Undo/Redo
  const historyRef = useRef(new HistoryStack());

  const touchHistory = () => setHistoryVersion((v) => v + 1);

  /* ---------- LOAD ---------- */
  const performLoad = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const v = await validateFile(file);
      
      if (!v.valid) {
        const err: EditPdfError = { 
          code: 'load', 
          message: v.error || 'Invalid PDF file.' 
        };
        setError(err);
        setState((s) => ({ ...s, document: null }));
        return;
      }

      const buffer = await file.arrayBuffer();
      
      const loaded = await loadPdfDocument(buffer, file.name, file.size);

      if (!loaded.validation.valid) {
        setError({
          code: loaded.validation.isEncrypted ? 'encrypted' : 'corrupt',
          message: loaded.validation.error || 'Failed to load document.',
        });
        setState((s) => ({ ...s, document: null }));
        return;
      }

      if (loaded.pages.length > EDIT_PDF_CONFIG.maxPageCount) {
        destroyDocument(loaded.pdf);
        setError({
          code: 'too-large',
          message: `Document has ${loaded.pages.length} pages (limit ${EDIT_PDF_CONFIG.maxPageCount}).`,
        });
        return;
      }

      const mappedPages: PDFPageState[] = loaded.pages.map((p) => ({
        id: p.id,
        originalIndex: p.originalIndex,
        rotation: p.rotation,
        width: p.dimensions.width,
        height: p.dimensions.height,
        objects: p.objects,
      }));

      const documentModel: DocumentModel = {
        id: loaded.meta.id,
        filename: loaded.meta.fileName,
        fileSize: loaded.meta.fileSize,
        sourceBytes: buffer,
        pages: mappedPages,
        dirty: false,
        status: 'ready',
        error: null,
      };

      setState((s) => ({
        ...s,
        document: documentModel,
        selection: {
          tool: 'select',
          pageId: mappedPages[0]?.id ?? null,
          objectId: null,
        },
        viewport: { zoom: 1, fitMode: 'none' },
        export: { status: 'idle', error: null },
      }));
      
      setPdfDoc(loaded.pdf);
      historyRef.current.clear();
      touchHistory();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const encrypted = /password|encrypt/i.test(msg);
      setError({
        code: encrypted ? 'encrypted' : 'load',
        message: encrypted
          ? 'This PDF is password-protected. Remove the password first.'
          : 'Failed to load this PDF. It may be corrupt.',
      });
      setState((s) => ({ ...s, document: null }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFile = useCallback((file: File) => performLoad(file), [performLoad]);

  const replaceFile = useCallback(
    async (file: File) => {
      if (pdfDoc) destroyDocument(pdfDoc);
      setPdfDoc(null);
      await performLoad(file);
    },
    [pdfDoc, performLoad],
  );

  /* ---------- SELECTION + VIEWPORT ---------- */
  const setTool = useCallback((tool: ActiveTool) => {
    setState((s) => ({ ...s, selection: { ...s.selection, tool, objectId: tool === 'select' ? s.selection.objectId : null } }));
  }, []);
  const setPage = useCallback((pageId: PageId) => {
    setState((s) => ({ ...s, selection: { ...s.selection, pageId, objectId: null } }));
  }, []);
  const setSelected = useCallback((objectId: string | null) => {
    setState((s) => ({ ...s, selection: { ...s.selection, objectId } }));
  }, []);
  const setZoom = useCallback((zoom: number) => {
    setState((s) => ({
      ...s,
      viewport: {
        zoom: Math.min(EDIT_PDF_CONFIG.maxZoom, Math.max(EDIT_PDF_CONFIG.minZoom, zoom)),
        fitMode: 'none',
      },
    }));
  }, []);
  const setFitMode = useCallback((mode: 'none' | 'width' | 'page') => {
    setState((s) => ({ ...s, viewport: { ...s.viewport, fitMode: mode } }));
  }, []);

  /* ---------- HISTORY ---------- */
  const pushHistory = useCallback((label: string, undo: () => void, redo: () => void) => {
    historyRef.current.push({ label, undo, redo });
    touchHistory();
  }, []);
  
  const undo = useCallback(() => { 
    if (historyRef.current.undo()) touchHistory(); 
  }, []);
  
  const redo = useCallback(() => { 
    if (historyRef.current.redo()) touchHistory(); 
  }, []);

  /* ---------- PAGE OPS ---------- */
  const rotatePage = useCallback((pageId: PageId) => {
    setState((prev) => {
      if (!prev.document) return prev;
      const page = prev.document.pages.find((p) => p.id === pageId);
      if (!page) return prev;
      const oldRot = page.rotation;
      const newRot = (oldRot + 90) % 360;
      pushHistory(
        'Rotate page',
        () => setState((s) => s.document ? { ...s, document: { ...s.document, pages: s.document.pages.map((p) => p.id === pageId ? { ...p, rotation: oldRot } : p), dirty: true } } : s),
        () => setState((s) => s.document ? { ...s, document: { ...s.document, pages: s.document.pages.map((p) => p.id === pageId ? { ...p, rotation: newRot } : p), dirty: true } } : s),
      );
      return {
        ...prev,
        document: {
          ...prev.document,
          pages: prev.document.pages.map((p) => (p.id === pageId ? { ...p, rotation: newRot } : p)),
          dirty: true,
        },
      };
    });
  }, [pushHistory]);

  const deletePage = useCallback((pageId: PageId) => {
    setState((prev) => {
      if (!prev.document || prev.document.pages.length <= 1) return prev;
      const idx = prev.document.pages.findIndex((p) => p.id === pageId);
      if (idx === -1) return prev;
      const removed = prev.document.pages[idx];
      const newPages = prev.document.pages.filter((p) => p.id !== pageId);
      const nextCurrent = prev.selection.pageId === pageId
        ? newPages[Math.min(idx, newPages.length - 1)]?.id ?? null
        : prev.selection.pageId;

      pushHistory(
        'Delete page',
        () => setState((s) => {
          if (!s.document) return s;
          const pages = [...s.document.pages];
          pages.splice(idx, 0, removed);
          return { ...s, document: { ...s.document, pages, dirty: true }, selection: { ...s.selection, pageId: removed.id, objectId: null } };
        }),
        () => setState((s) => {
          if (!s.document) return s;
          const pages = s.document.pages.filter((p) => p.id !== pageId);
          return { ...s, document: { ...s.document, pages, dirty: true }, selection: { ...s.selection, pageId: pages[Math.min(idx, pages.length - 1)]?.id ?? null, objectId: null } };
        }),
      );
      return {
        ...prev,
        document: { ...prev.document, pages: newPages, dirty: true },
        selection: { ...prev.selection, pageId: nextCurrent, objectId: null },
      };
    });
  }, [pushHistory]);

  const duplicatePage = useCallback((pageId: PageId) => {
    setState((prev) => {
      if (!prev.document) return prev;
      const idx = prev.document.pages.findIndex((p) => p.id === pageId);
      if (idx === -1) return prev;
      const original = prev.document.pages[idx];
      const clone: PDFPageState = {
        ...original,
        id: uid(),
        objects: original.objects.map((o) => ({ ...o, id: uid(), pageId: '' as PageId })),
      };
      clone.objects = clone.objects.map((o) => ({ ...o, pageId: clone.id }));
      const newPages = [...prev.document.pages];
      newPages.splice(idx + 1, 0, clone);
      
      pushHistory(
        'Duplicate page',
        () => setState((s) => {
          if (!s.document) return s;
          return { ...s, document: { ...s.document, pages: s.document.pages.filter((p) => p.id !== clone.id), dirty: true } };
        }),
        () => setState((s) => {
          if (!s.document) return s;
          const pages = [...s.document.pages];
          pages.splice(idx + 1, 0, clone);
          return { ...s, document: { ...s.document, pages, dirty: true } };
        }),
      );
      return { ...prev, document: { ...prev.document, pages: newPages, dirty: true } };
    });
  }, [pushHistory]);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      if (!prev.document) return prev;
      if (fromIndex === toIndex) return prev;
      const pages = [...prev.document.pages];
      const [moved] = pages.splice(fromIndex, 1);
      pages.splice(toIndex, 0, moved);
      
      pushHistory(
        'Reorder pages',
        () => setState((s) => {
          if (!s.document) return s;
          const p = [...s.document.pages];
          const [m] = p.splice(toIndex, 1);
          p.splice(fromIndex, 0, m);
          return { ...s, document: { ...s.document, pages: p, dirty: true } };
        }),
        () => setState((s) => {
          if (!s.document) return s;
          const p = [...s.document.pages];
          const [m] = p.splice(fromIndex, 1);
          p.splice(toIndex, 0, m);
          return { ...s, document: { ...s.document, pages: p, dirty: true } };
        }),
      );
      return { ...prev, document: { ...prev.document, pages, dirty: true } };
    });
  }, [pushHistory]);

  /* ---------- OBJECT OPS ---------- */
  const addObject = useCallback((pageId: PageId, obj: EditableObject) => {
    setState((prev) => {
      if (!prev.document) return prev;
      const page = prev.document.pages.find((p) => p.id === pageId);
      if (!page) return prev;
      const newPages = prev.document.pages.map((p) =>
        p.id === pageId ? { ...p, objects: [...p.objects, obj] } : p,
      );
      
      pushHistory(
        `Add ${obj.type}`,
        () => setState((s) => s.document ? {
          ...s,
          document: { ...s.document, pages: s.document.pages.map((p) => p.id === pageId ? { ...p, objects: p.objects.filter((o) => o.id !== obj.id) } : p), dirty: true },
          selection: { ...s.selection, objectId: null },
        } : s),
        () => setState((s) => s.document ? {
          ...s,
          document: { ...s.document, pages: s.document.pages.map((p) => p.id === pageId ? { ...p, objects: [...p.objects, obj] } : p), dirty: true },
        } : s),
      );
      return {
        ...prev,
        document: { ...prev.document, pages: newPages, dirty: true },
        selection: { ...prev.selection, objectId: obj.id },
      };
    });
  }, [pushHistory]);

  const updateObject = useCallback((pageId: PageId, objectId: string, patch: Partial<EditableObject>) => {
    setState((prev) => {
      if (!prev.document) return prev;
      const page = prev.document.pages.find((p) => p.id === pageId);
      if (!page) return prev;
      const obj = page.objects.find((o) => o.id === objectId);
      if (!obj) return prev;
      const before = { ...obj };
      const after = { ...obj, ...patch } as EditableObject;
      const apply = (o: EditableObject) => o.id === objectId ? after : o;
      const revert = (o: EditableObject) => o.id === objectId ? before : o;
      
      pushHistory(
        'Update object',
        () => setState((s) => s.document ? { ...s, document: { ...s.document, pages: s.document.pages.map((p) => p.id === pageId ? { ...p, objects: p.objects.map(revert) } : p), dirty: true } } : s),
        () => setState((s) => s.document ? { ...s, document: { ...s.document, pages: s.document.pages.map((p) => p.id === pageId ? { ...p, objects: p.objects.map(apply) } : p), dirty: true } } : s),
      );
      return {
        ...prev,
        document: {
          ...prev.document,
          pages: prev.document.pages.map((p) => p.id === pageId ? { ...p, objects: p.objects.map(apply) } : p),
          dirty: true,
        },
      };
    });
  }, [pushHistory]);

  const deleteObject = useCallback((pageId: PageId, objectId: string) => {
    setState((prev) => {
      if (!prev.document) return prev;
      const page = prev.document.pages.find((p) => p.id === pageId);
      if (!page) return prev;
      const obj = page.objects.find((o) => o.id === objectId);
      if (!obj) return prev;
      
      pushHistory(
        'Delete object',
        () => setState((s) => s.document ? {
          ...s,
          document: { ...s.document, pages: s.document.pages.map((p) => p.id === pageId ? { ...p, objects: [...p.objects, obj] } : p), dirty: true },
        } : s),
        () => setState((s) => s.document ? {
          ...s,
          document: { ...s.document, pages: s.document.pages.map((p) => p.id === pageId ? { ...p, objects: p.objects.filter((o) => o.id !== objectId) } : p), dirty: true },
          selection: { ...s.selection, objectId: null },
        } : s),
      );
      return {
        ...prev,
        document: {
          ...prev.document,
          pages: prev.document.pages.map((p) => p.id === pageId ? { ...p, objects: p.objects.filter((o) => o.id !== objectId) } : p),
          dirty: true,
        },
        selection: { ...prev.selection, objectId: null },
      };
    });
  }, [pushHistory]);

  const duplicateObject = useCallback((pageId: PageId, objectId: string) => {
    setState((prev) => {
      if (!prev.document) return prev;
      const page = prev.document.pages.find((p) => p.id === pageId);
      const obj = page?.objects.find((o) => o.id === objectId);
      if (!obj) return prev;
      const clone = { ...obj, id: uid(), x: obj.x + 12, y: obj.y - 12 } as EditableObject;
      const newPages = prev.document.pages.map((p) => p.id === pageId ? { ...p, objects: [...p.objects, clone] } : p);
      
      pushHistory(
        'Duplicate object',
        () => setState((s) => s.document ? { ...s, document: { ...s.document, pages: s.document.pages.map((p) => p.id === pageId ? { ...p, objects: p.objects.filter((o) => o.id !== clone.id) } : p), dirty: true } } : s),
        () => setState((s) => s.document ? { ...s, document: { ...s.document, pages: s.document.pages.map((p) => p.id === pageId ? { ...p, objects: [...p.objects, clone] } : p), dirty: true } } : s),
      );
      return { ...prev, document: { ...prev.document, pages: newPages, dirty: true }, selection: { ...prev.selection, objectId: clone.id } };
    });
  }, [pushHistory]);

  /* ---------- BUILDERS ---------- */
  const createText = useCallback((pageId: PageId, x: number, y: number): TextObject => ({
    id: uid(), pageId, type: 'text', x, y, width: 180, height: 24, rotation: 0, opacity: 1,
    text: 'New text', fontFamily: 'Helvetica', fontSize: 16, color: '#000000',
    bold: false, italic: false, underline: false, align: 'left',
  }), []);

  const createImage = useCallback((pageId: PageId, x: number, y: number, src: string, mime: 'image/png' | 'image/jpeg', w: number, h: number): ImageObject => ({
    id: uid(), pageId, type: 'image', x, y, width: w, height: h, rotation: 0, opacity: 1, src, mime,
  }), []);

  const createAnnotation = useCallback((pageId: PageId, shape: AnnotationObject['shape'], x: number, y: number, w: number, h: number, color = '#2563eb'): AnnotationObject => ({
    id: uid(), pageId, type: 'annotation', x, y, width: w, height: h, rotation: 0,
    opacity: shape === 'highlight' ? 0.4 : 1, shape, color, lineWidth: 2,
  }), []);

  const createSignature = useCallback((pageId: PageId, x: number, y: number, src: string): SignatureObject => ({
    id: uid(), pageId, type: 'signature', x, y, width: 180, height: 75, rotation: 0, opacity: 1, src,
  }), []);

  const createComment = useCallback((pageId: PageId, x: number, y: number, text = 'Comment'): CommentObject => ({
    id: uid(), pageId, type: 'comment', x, y, width: 24, height: 24, rotation: 0, opacity: 1, text, color: '#f59e0b',
  }), []);

  const createLink = useCallback((pageId: PageId, x: number, y: number, w: number, h: number, url: string): LinkObject => ({
    id: uid(), pageId, type: 'link', x, y, width: w, height: h, rotation: 0, opacity: 1, url,
  }), []);

  /* ---------- EXPORT ---------- */
  const exportDocument = useCallback(async () => {
    if (!state.document) return;
    setState((s) => ({ ...s, export: { status: 'exporting', error: null } }));
    try {
      const bytes = await exportPDF(state.document);
      
      // FIXED: Cast to any to bypass TypeScript 5.7's strict ArrayBuffer checks
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      
      const base = state.document.filename.replace(/\.pdf$/i, '');
      downloadBlob(blob, `edited-${base}.pdf`);
      setState((s) => ({ ...s, document: s.document ? { ...s.document, dirty: false } : null, export: { status: 'success', error: null } }));
    } catch (e) {
      setState((s) => ({
        ...s,
        export: { status: 'error', error: { code: 'export', message: e instanceof Error ? e.message : 'Export failed.' } },
      }));
    }
  }, [state.document]);

  const reset = useCallback(async () => {
    if (pdfDoc) destroyDocument(pdfDoc);
    setPdfDoc(null);
    setState(initialState);
    setError(null);
    historyRef.current.clear();
    touchHistory();
  }, [pdfDoc]);

  return {
    state,
    pdfDoc,
    isLoading,
    error,
    canUndo: historyRef.current.canUndo(),
    canRedo: historyRef.current.canRedo(),
    loadFile,
    replaceFile,
    reset,
    exportDocument,
    setTool,
    setPage,
    setSelected,
    setZoom,
    setFitMode,
    rotatePage,
    deletePage,
    duplicatePage,
    reorderPages,
    addObject,
    updateObject,
    deleteObject,
    duplicateObject,
    createText,
    createImage,
    createAnnotation,
    createSignature,
    createComment,
    createLink,
    undo,
    redo,
  };
}
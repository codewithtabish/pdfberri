// src/components/pages/tools/sign-pdf/sign-pdf-workspace.tsx
"use client";
import { useState } from "react";
import type * as pdfjsLib from "pdfjs-dist";
import { SignPdfToolbar } from "./sign-pdf-toolbar";
import { SignPdfDocumentViewer } from "./sign-pdf-document-viewer";
import { SignPdfSignaturePanel } from "./sign-pdf-signature-panel";
import { SignPdfUpload } from "./sign-pdf-upload";
import { SignPdfProgress } from "./sign-pdf-progress";
import { loadPdf } from "./sign-pdf-loader";
import { exportSignedPdf } from "./sign-pdf-exporter";
import { uid } from "./sign-pdf-utils";
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from "./sign-pdf-constants";
import type { PlacedElement, FieldType } from "./sign-pdf-types";
import { SignPdfResult } from "./sign-pdf-result";
import { validatePdf } from "./sign-pdf-validation";

export function SignPdfWorkspace() {
  const [status, setStatus] = useState<"empty" | "loading" | "ready" | "exporting" | "success">("empty");
  const [error, setError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1.2);
  const [elements, setElements] = useState<PlacedElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleFile = async (f: File) => {
    const err = validatePdf(f);
    if (err) return setError(err);
    setStatus("loading"); setError(null);
    try {
      const { doc, originalBytes } = await loadPdf(f);
      setPdfDoc(doc); setPdfBytes(originalBytes); setPdfFile(f);
      setPageIndex(0); setElements([]); setStatus("ready");
    } catch (e) {
      setError("Could not open this PDF. It may be corrupt or password-protected.");
      setStatus("empty");
    }
  };

  const addElement = (type: FieldType, dataUrl?: string, text?: string) => {
    const newEl: PlacedElement = {
      id: uid(), type, pageIndex, x: 0.4, y: 0.4,
      w: type === "signature" ? 0.25 : 0.15,
      h: type === "signature" ? 0.1 : 0.05,
      dataUrl, text, fontSize: 14,
    };
    setElements((prev) => [...prev, newEl]); setSelectedId(newEl.id);
  };

  const handleExport = async () => {
    if (!pdfBytes || !pdfFile) return;
    setStatus("exporting");
    try {
      await exportSignedPdf(pdfBytes, elements, pdfFile.name);
      setStatus("success");
    } catch (err) {
      alert("Export failed. Please try again."); setStatus("ready");
    }
  };

  const reset = () => {
    setStatus("empty"); setPdfDoc(null); setPdfBytes(null); setPdfFile(null);
    setElements([]); setSelectedId(null); setError(null);
  };

  if (status === "loading") return <SignPdfProgress />;
  if (status === "success") return <SignPdfResult onReset={reset} />;
  if (status === "empty" || !pdfDoc) return <SignPdfUpload onFile={handleFile} error={error} />;

  return (
    <div className="flex flex-col gap-3">
      <SignPdfToolbar filename={pdfFile!.name} pageIndex={pageIndex} pageCount={pdfDoc.numPages} zoom={zoom}
        onPrevPage={() => setPageIndex((i) => Math.max(0, i - 1))} onNextPage={() => setPageIndex((i) => Math.min(pdfDoc.numPages - 1, i + 1))}
        onZoomIn={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))} onZoomOut={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
        onExport={handleExport} isExporting={status === "exporting"} />
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex-1" onClick={() => setSelectedId(null)}>
          <SignPdfDocumentViewer pdfDoc={pdfDoc} pageIndex={pageIndex} zoom={zoom} elements={elements} selectedId={selectedId}
            onSelect={setSelectedId} onUpdate={(id, upd) => setElements((prev) => prev.map((el) => el.id === id ? { ...el, ...upd } : el))}
            onDelete={(id) => { setElements((prev) => prev.filter((el) => el.id !== id)); if (selectedId === id) setSelectedId(null); }} />
        </div>
        <SignPdfSignaturePanel onAddElement={addElement} />
      </div>
    </div>
  );
}
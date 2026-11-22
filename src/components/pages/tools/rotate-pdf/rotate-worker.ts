import { PDFDocument, degrees } from "pdf-lib";

// Explicitly type 'self' as a Worker context to resolve postMessage overloads
const ctx = self as unknown as {
  postMessage: (message: any, transfer?: Transferable[]) => void;
  onmessage: ((event: MessageEvent) => void) | null;
};

ctx.onmessage = async (e: MessageEvent) => {
  const { buffer, rotations } = e.data;
  
  try {
    const pdfDoc = await PDFDocument.load(buffer, { updateMetadata: false });
    const pages = pdfDoc.getPages();
    const total = pages.length;

    ctx.postMessage({ type: "progress", payload: { current: 0, total } });

    for (let i = 0; i < total; i++) {
      const pending = rotations[i] || 0;
      if (pending !== 0) {
        const page = pages[i];
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + pending) % 360));
      }
      
      // Simulate progress for the UI (every 10 pages)
      if (i % 10 === 0) {
        ctx.postMessage({ type: "progress", payload: { current: i, total } });
      }
    }

    const bytes = await pdfDoc.save({ useObjectStreams: true });
    
    // Ensure the ArrayBuffer is exactly sliced to avoid transferring extra bytes
    const exactBuffer = bytes.buffer.slice(
      bytes.byteOffset, 
      bytes.byteOffset + bytes.byteLength
    );

    ctx.postMessage(
      { type: "done", payload: { buffer: exactBuffer, pageCount: total } }, 
      [exactBuffer]
    );
  } catch (err: any) {
    const message = err.message?.includes("encrypted")
      ? "This PDF is password-protected and cannot be rotated."
      : "Failed to process the PDF. It may be corrupted.";
    ctx.postMessage({ type: "error", payload: { message } });
  }
};
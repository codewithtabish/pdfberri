import { EncryptedPDFError, PDFDocument } from "pdf-lib";
import type { SplitWorkerRequest, SplitWorkerResponse } from "./split-types";

const scope = self as unknown as Worker;

function post(message: SplitWorkerResponse, transfer: Transferable[] = []) {
  scope.postMessage(message, transfer);
}

self.onmessage = async (event: MessageEvent<SplitWorkerRequest>) => {
  if (event.data.type !== "start") return;
  const { buffer, outputs } = event.data;
  const total = outputs.length;

  try {
    post({ type: "progress", stage: "preparing", completed: 0, total });
    // No ignoreEncryption: protected files are rejected, never bypassed.
    const source = await PDFDocument.load(buffer);
    const pageTotal = source.getPageCount();

    for (let i = 0; i < total; i += 1) {
      const { id, pageIndices } = outputs[i];
      if (pageIndices.length === 0 || pageIndices.some((p) => p < 0 || p >= pageTotal)) {
        post({ type: "failed", code: "processing-failed", message: "The split settings don't match this PDF. Please review them and try again." });
        return;
      }
      post({ type: "progress", stage: "processing", completed: i, total });

      const document = await PDFDocument.create();
      const pages = await document.copyPages(source, pageIndices);
      pages.forEach((page) => document.addPage(page));
      const bytes = await document.save();

      const copy = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      post({ type: "output", id, bytes: copy }, [copy]);
    }

    post({ type: "progress", stage: "finalizing", completed: total, total });
    post({ type: "done" });
  } catch (error) {
    if (error instanceof EncryptedPDFError) {
      post({ type: "failed", code: "encrypted", message: "This PDF is password-protected, so it can't be split here." });
    } else {
      post({ type: "failed", code: "processing-failed", message: "We couldn't split this PDF. It may be damaged or use unsupported features." });
    }
  }
};

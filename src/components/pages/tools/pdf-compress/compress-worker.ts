import { PDFDocument } from "pdf-lib";
import type { CompressWorkerRequest, CompressWorkerResponse } from "./compress-types";

const scope = self as unknown as Worker;

function post(message: CompressWorkerResponse, transfer: Transferable[] = []) {
  scope.postMessage(message, transfer);
}

scope.onmessage = async (event: MessageEvent<CompressWorkerRequest>) => {
  const { buffer, settings } = event.data;
  try {
    post({ type: "progress", stage: "preparing", completed: 0, total: 3 });

    const source = await PDFDocument.load(buffer, {
      updateMetadata: false,
      ignoreEncryption: false,
    });
    const pageCount = source.getPageCount();

    post({ type: "progress", stage: "optimizing", completed: 1, total: 3 });

    if (settings.stripMetadata) {
      if (source.getTitle()) source.setTitle("");
      if (source.getAuthor()) source.setAuthor("");
      if (source.getSubject()) source.setSubject("");
      if (source.getKeywords()) source.setKeywords([]);
      if (source.getCreator()) source.setCreator("");
      if (source.getProducer()) source.setProducer("");
    }
    if (settings.updateModificationDate) {
      source.setModificationDate(new Date());
    }

    post({ type: "progress", stage: "finalizing", completed: 2, total: 3 });

    const bytes = await source.save({
      useObjectStreams: settings.useObjectStreams,
      addDefaultPage: false,
      updateFieldAppearances: false,
    });

    const copy =
      bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength
        ? (bytes.buffer as ArrayBuffer)
        : (bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);

    post({ type: "progress", stage: "finalizing", completed: 3, total: 3 });
    post({ type: "done", bytes: copy, pageCount }, [copy]);
  } catch (error) {
    const message =
      error instanceof Error && /encrypt/i.test(error.message)
        ? "This PDF is password-protected, so it can't be compressed here."
        : "We couldn't optimize this PDF. It may be damaged or use unsupported features.";
    const code = /encrypt/i.test(message) ? "encrypted" : "processing-failed";
    post({ type: "failed", code, message });
  }
};
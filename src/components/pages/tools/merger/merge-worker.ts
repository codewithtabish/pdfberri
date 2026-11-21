import { MergeErrorCode, WorkerRequest, WorkerResponse, WorkItem } from "@/components/pages/tools/merger/merge-types";
import { EncryptedPDFError, PDFDocument } from "pdf-lib";


/**
 * Runs off the main thread. Reads files locally and merges with pdf-lib.
 * Nothing here makes a network request.
 */
const ctx = self as unknown as {
  postMessage(message: WorkerResponse, transfer?: Transferable[]): void;
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
};

function classifyLoadError(error: unknown): MergeErrorCode {
  if (error instanceof EncryptedPDFError) return "encrypted";
  if (error instanceof RangeError) return "memory";
  return "corrupted";
}

async function inspect(items: WorkItem[]): Promise<void> {
  for (const item of items) {
    try {
      const bytes = await item.file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { updateMetadata: false });
      ctx.postMessage({
        type: "inspected",
        id: item.id,
        pageCount: doc.getPageCount(),
      });
    } catch (error) {
      ctx.postMessage({
        type: "inspect-failed",
        id: item.id,
        code: classifyLoadError(error),
      });
    }
  }
}

async function merge(items: WorkItem[]): Promise<void> {
  const total = items.length;
  ctx.postMessage({ type: "progress", stage: "preparing", completed: 0, total });

  try {
    const merged = await PDFDocument.create();
    merged.setProducer("PDFBerri");
    merged.setCreator("PDFBerri");
    let pageCount = 0;

    // Files are processed one at a time so only one source PDF is in memory.
    for (let i = 0; i < total; i++) {
      const item = items[i];
      if (!item) continue;

      ctx.postMessage({ type: "progress", stage: "reading", completed: i, total });

      let source: PDFDocument;
      try {
        const bytes = await item.file.arrayBuffer();
        source = await PDFDocument.load(bytes, { updateMetadata: false });
      } catch (error) {
        ctx.postMessage({
          type: "merge-failed",
          code: classifyLoadError(error),
          fileId: item.id,
        });
        return;
      }

      ctx.postMessage({ type: "progress", stage: "combining", completed: i, total });

      const pages = await merged.copyPages(source, source.getPageIndices());
      for (const page of pages) merged.addPage(page);
      pageCount += pages.length;

      ctx.postMessage({
        type: "progress",
        stage: "combining",
        completed: i + 1,
        total,
      });
    }

    ctx.postMessage({ type: "progress", stage: "finalizing", completed: total, total });

    const bytes = await merged.save();
    const exactBuffer =
      bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength;
    const buffer = (
      exactBuffer
        ? bytes.buffer
        : bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    ) as ArrayBuffer;

    ctx.postMessage({ type: "merged", buffer, pageCount }, [buffer]);
  } catch (error) {
    ctx.postMessage({
      type: "merge-failed",
      code: error instanceof RangeError ? "memory" : "failed",
    });
  }
}

ctx.onmessage = (event) => {
  const request = event.data;
  if (request.type === "inspect") void inspect(request.items);
  else if (request.type === "merge") void merge(request.items);
};
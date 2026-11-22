// src/components/pages/tools/word-to-pdf/word-to-pdf-engine.ts
//
// Engine selection and the verified conversion pipeline shared by all engines.

import { PDF_MIME } from "./word-to-pdf-constants";
import { cloudWordToPdfEngine } from "./word-to-pdf-cloud-engine";
import { localWordToPdfEngine } from "./word-to-pdf-local-engine";
import { WordToPdfError } from "./word-to-pdf-errors";
import { pdfBytesToBlob, verifyPdfBytes } from "./word-to-pdf-pdf-verify";
import type {
  ConversionOutput,
  ConversionRequest,
  EngineId,
  WordFormat,
  WordToPdfEngine,
} from "./word-to-pdf-types";
import {
  buildPdfFileName,
  normalizeSettings,
  throwIfAborted,
} from "./word-to-pdf-utils";

export function getEngine(id: EngineId): WordToPdfEngine {
  return id === "local" ? localWordToPdfEngine : cloudWordToPdfEngine;
}

export interface EngineSelectionInput {
  format: WordFormat;
  cloudAvailable: boolean;
  /** Set when the user explicitly chose server conversion (e.g. after a local failure). */
  preferCloud?: boolean;
}

/**
 * DOCX → browser engine by default (private, no upload).
 * DOC → server only. Returns null when nothing can convert the file.
 */
export function selectEngineId(input: EngineSelectionInput): EngineId | null {
  if (input.preferCloud && input.cloudAvailable) return "cloud";
  if (input.format === "docx") return "local";
  return input.cloudAvailable ? "cloud" : null;
}

/** Runs an engine, then verifies the result before it can be offered to the user. */
export async function runWordToPdf(
  engine: WordToPdfEngine,
  request: ConversionRequest,
): Promise<ConversionOutput> {
  if (!engine.supportedFormats.includes(request.file.format)) {
    throw new WordToPdfError("ENGINE_UNAVAILABLE");
  }
  throwIfAborted(request.signal);

  const settings = normalizeSettings(request.settings);
  const output = await engine.convert({ ...request, settings });
  throwIfAborted(request.signal);

  request.onProgress?.({ phase: "verifying", message: "Checking your PDF…" });
  const bytes = new Uint8Array(await output.blob.arrayBuffer());
  const verified = await verifyPdfBytes(bytes, output.pageCount ?? undefined);

  const fileName = buildPdfFileName(request.file.file.name);
  const blob =
    output.blob.type === PDF_MIME ? output.blob : pdfBytesToBlob(bytes);

  return {
    blob,
    fileName,
    sizeBytes: bytes.byteLength,
    pageCount: verified.pageCount,
    engine: output.engine,
  };
}

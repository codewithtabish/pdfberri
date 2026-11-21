import type { SplitOutput } from "./split-types";

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  // Keep the URL alive long enough for large files to start streaming to disk.
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 60_000);
}

/** PDFs are already compressed, so STORE keeps ZIP creation fast. JSZip loads on demand. */
export async function createZipBlob(outputs: readonly SplitOutput[]): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const output of outputs) zip.file(output.filename, output.blob);
  return zip.generateAsync({ type: "blob", compression: "STORE" });
}
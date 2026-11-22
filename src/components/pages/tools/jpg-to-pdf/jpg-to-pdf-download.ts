/** Starts a browser download for a Blob and revokes its URL afterwards. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

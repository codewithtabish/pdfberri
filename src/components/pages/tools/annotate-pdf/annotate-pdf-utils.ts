// src/components/pages/tools/annotate-pdf/annotate-pdf-utils.ts

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function bytesToMb(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function safeFilename(name: string): string {
  return name.replace(/\.pdf$/i, "") + "-annotated.pdf";
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Normalize client (CSS px) coords to 0..1 page space.
export function screenToPageNorm(
  clientX: number,
  clientY: number,
  rect: DOMRect
) {
  return {
    x: clamp((clientX - rect.left) / rect.width, 0, 1),
    y: clamp((clientY - rect.top) / rect.height, 0, 1),
  };
}

export function pageNormToPx(p: { x: number; y: number }, w: number, h: number) {
  return { x: p.x * w, y: p.y * h };
}
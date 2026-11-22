export class RotateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RotateError";
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function normalizeRotation(angle: number): number {
  return ((Math.round(angle / 90) * 90) % 360 + 360) % 360;
}

export function getEffectiveRotation(original: number, pending: number): number {
  return normalizeRotation(original + pending);
}
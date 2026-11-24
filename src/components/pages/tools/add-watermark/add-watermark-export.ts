export function createOutputBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as any], { type: 'application/pdf' });
}
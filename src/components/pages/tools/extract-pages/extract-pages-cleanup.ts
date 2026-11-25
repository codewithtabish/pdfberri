export function cleanupThumbnails() {
  document.querySelectorAll('canvas').forEach(c => {
    c.width = 0; c.height = 0;
  });
}
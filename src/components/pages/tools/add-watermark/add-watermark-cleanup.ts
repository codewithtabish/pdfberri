export function cleanupPreviewCanvases() {
  const canvases = document.querySelectorAll('canvas');
  canvases.forEach(c => {
    const ctx = c.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, c.width, c.height);
    c.width = 0;
    c.height = 0;
  });
}
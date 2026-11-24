export function generateTypedSignature(text: string, font: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 150;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1e3a8a";
  ctx.font = `48px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  return canvas.toDataURL("image/png");
}
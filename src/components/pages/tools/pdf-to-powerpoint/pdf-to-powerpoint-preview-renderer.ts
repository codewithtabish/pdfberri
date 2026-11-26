import type { SlideModel } from "./pdf-to-powerpoint-types";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image failed"));
    image.src = src;
  });
}

/** Draws the exact SlideModel that the PPTX builder consumes. */
export async function drawSlideModel(
  canvas: HTMLCanvasElement,
  model: SlideModel,
  pixelWidth: number,
  isCurrent: () => boolean,
): Promise<void> {
  const images = await Promise.all(
    model.elements.map((el) => (el.type === "image" ? loadImage(el.dataUrl).catch(() => null) : null)),
  );
  if (!isCurrent()) return;

  canvas.width = Math.round(pixelWidth);
  canvas.height = Math.round((pixelWidth * model.size.height) / model.size.width);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const ppi = canvas.width / model.size.width;

  ctx.fillStyle = `#${model.background}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  model.elements.forEach((el, index) => {
    if (el.type === "image") {
      const image = images[index];
      if (image) ctx.drawImage(image, el.box.x * ppi, el.box.y * ppi, el.box.w * ppi, el.box.h * ppi);
      return;
    }

    const boxW = el.box.w * ppi;
    const boxH = el.box.h * ppi;
    ctx.save();
    ctx.translate((el.box.x + el.box.w / 2) * ppi, (el.box.y + el.box.h / 2) * ppi);
    ctx.rotate((el.rotate * Math.PI) / 180);
    ctx.textBaseline = "alphabetic";

    const fontFor = (run: (typeof el.runs)[number]) =>
      `${run.italic ? "italic " : ""}${run.bold ? "bold " : ""}${(run.fontSize / 72) * ppi}px "${run.fontFace}", Arial, sans-serif`;

    if (el.rtl) {
      const run = el.runs[0];
      if (run) {
        ctx.direction = "rtl";
        ctx.textAlign = "right";
        ctx.font = fontFor(run);
        ctx.fillStyle = `#${run.color}`;
        ctx.fillText(
          el.runs.map((r) => r.text).join(""),
          boxW / 2,
          -boxH / 2 + 0.92 * ((run.fontSize / 72) * ppi),
        );
      }
    } else {
      ctx.textAlign = "left";
      let cursor = -boxW / 2;
      for (const run of el.runs) {
        ctx.font = fontFor(run);
        ctx.fillStyle = `#${run.color}`;
        ctx.fillText(run.text, cursor, -boxH / 2 + 0.92 * ((run.fontSize / 72) * ppi));
        cursor += ctx.measureText(run.text).width;
      }
    }
    ctx.restore();
  });
}

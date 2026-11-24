// src/components/pages/tools/annotate-pdf/annotate-pdf-annotation-renderer.ts
import type { Annotation } from "./annotate-pdf-types";

export function drawAnnotations(
  ctx: CanvasRenderingContext2D,
  annotations: Annotation[],
  pageIndex: number,
  w: number,
  h: number
) {
  const list = annotations.filter((a) => a.pageIndex === pageIndex);
  for (const a of list) {
    ctx.save();
    if ("opacity" in a) ctx.globalAlpha = a.opacity;

    switch (a.kind) {
      case "highlight":
        for (const r of a.regions) {
          ctx.fillStyle = a.color;
          ctx.fillRect(r.x * w, r.y * h, r.w * w, r.h * h);
        }
        break;
      case "underline":
        ctx.strokeStyle = a.color;
        ctx.lineWidth = a.thickness;
        for (const s of a.segments) {
          ctx.beginPath();
          ctx.moveTo(s.x1 * w, s.y1 * h);
          ctx.lineTo(s.x2 * w, s.y2 * h);
          ctx.stroke();
        }
        break;
      case "strikethrough":
        ctx.strokeStyle = a.color;
        ctx.lineWidth = a.thickness;
        for (const s of a.segments) {
          ctx.beginPath();
          ctx.moveTo(s.x1 * w, s.y1 * h);
          ctx.lineTo(s.x2 * w, s.y2 * h);
          ctx.stroke();
        }
        break;
      case "freehand":
        ctx.strokeStyle = a.color;
        ctx.lineWidth = a.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (a.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(a.points[0].x * w, a.points[0].y * h);
          for (let i = 1; i < a.points.length; i++) {
            ctx.lineTo(a.points[i].x * w, a.points[i].y * h);
          }
          ctx.stroke();
        }
        break;
      case "rect":
        if (a.fill) {
          ctx.fillStyle = a.fill;
          ctx.fillRect(a.x * w, a.y * h, a.w * w, a.h * h);
        }
        ctx.strokeStyle = a.stroke;
        ctx.lineWidth = a.strokeWidth;
        ctx.strokeRect(a.x * w, a.y * h, a.w * w, a.h * h);
        break;
      case "circle":
        ctx.beginPath();
        ctx.ellipse(
          (a.x + a.w / 2) * w,
          (a.y + a.h / 2) * h,
          (a.w * w) / 2,
          (a.h * h) / 2,
          0,
          0,
          Math.PI * 2
        );
        if (a.fill) {
          ctx.fillStyle = a.fill;
          ctx.fill();
        }
        ctx.strokeStyle = a.stroke;
        ctx.lineWidth = a.strokeWidth;
        ctx.stroke();
        break;
      case "arrow": {
        ctx.strokeStyle = a.color;
        ctx.lineWidth = a.strokeWidth;
        const x1 = a.x1 * w, y1 = a.y1 * h, x2 = a.x2 * w, y2 = a.y2 * h;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const size = 10;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - size * Math.cos(angle - 0.4), y2 - size * Math.sin(angle - 0.4));
        ctx.lineTo(x2 - size * Math.cos(angle + 0.4), y2 - size * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fillStyle = a.color;
        ctx.fill();
        break;
      }
      case "line":
        ctx.strokeStyle = a.color;
        ctx.lineWidth = a.strokeWidth;
        ctx.beginPath();
        ctx.moveTo(a.x1 * w, a.y1 * h);
        ctx.lineTo(a.x2 * w, a.y2 * h);
        ctx.stroke();
        break;
      case "text": {
        const fs = a.fontSize;
        ctx.font = `${fs}px system-ui, sans-serif`;
        const lines = a.text.split("\n");
        const lineH = fs * 1.25;
        if (a.background && a.background !== "transparent") {
          ctx.fillStyle = a.background;
          ctx.fillRect(a.x * w, a.y * h, a.w * w, lineH * lines.length + 6);
        }
        ctx.fillStyle = a.color;
        lines.forEach((line, i) => {
          ctx.fillText(line, a.x * w + 2, a.y * h + fs + i * lineH);
        });
        break;
      }
      case "comment": {
        ctx.fillStyle = a.color;
        ctx.fillRect(a.x * w, a.y * h, 20, 14);
        ctx.fillStyle = "#111";
        ctx.font = "10px system-ui, sans-serif";
        ctx.fillText("💬", a.x * w + 4, a.y * h + 12);
        break;
      }
    }
    ctx.restore();
  }
}
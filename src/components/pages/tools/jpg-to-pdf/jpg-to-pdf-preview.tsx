"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@/components/general/icons/pdf-icons";
import { computePageLayout, placeRotatedImage } from "./jpg-to-pdf-layout";
import type { ImageItem, PdfSettings } from "./jpg-to-pdf-types";
import { clamp, ptToMm } from "./jpg-to-pdf-utils";

interface JpgToPdfPreviewProps {
  images: readonly ImageItem[];
  settings: PdfSettings;
}

const MAX_PREVIEW_WIDTH = 260;
const MAX_PREVIEW_HEIGHT = 320;

/** Uses the exact same layout math as the PDF engine. */
export function JpgToPdfPreview({ images, settings }: JpgToPdfPreviewProps) {
  const [requested, setRequested] = useState(0);
  const index = clamp(requested, 0, Math.max(0, images.length - 1));
  const image = images[index];
  if (!image) return null;

  const turned = image.rotation % 180 !== 0;
  const effectiveWidth = turned ? image.displayHeight : image.displayWidth;
  const effectiveHeight = turned ? image.displayWidth : image.displayHeight;

  const layout = computePageLayout(effectiveWidth, effectiveHeight, settings);
  const scale = Math.min(MAX_PREVIEW_WIDTH / layout.pageWidth, MAX_PREVIEW_HEIGHT / layout.pageHeight);
  const pageW = layout.pageWidth * scale;
  const pageH = layout.pageHeight * scale;

  const { content } = layout;
  // PDF origin is bottom-left; CSS origin is top-left.
  const contentLeft = content.x * scale;
  const contentTop = (layout.pageHeight - content.y - content.height) * scale;

  const placed = placeRotatedImage(layout.image, image.rotation);
  const boxLeft = layout.image.x * scale;
  const boxTop = (layout.pageHeight - layout.image.y - layout.image.height) * scale;
  const boxW = layout.image.width * scale;
  const boxH = layout.image.height * scale;
  const imgW = placed.width * scale;
  const imgH = placed.height * scale;
  const imgLeft = boxLeft + boxW / 2 - imgW / 2 - contentLeft;
  const imgTop = boxTop + boxH / 2 - imgH / 2 - contentTop;

  const dimensions =
    settings.pageSize === "fit"
      ? `${Math.round(layout.pageWidth)} × ${Math.round(layout.pageHeight)} pt`
      : `${ptToMm(layout.pageWidth)} × ${ptToMm(layout.pageHeight)} mm`;

  return (
    <section
      aria-labelledby="jpg-to-pdf-preview-heading"
      className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted/40 p-4"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <h2 id="jpg-to-pdf-preview-heading" className="text-base font-bold text-foreground">
          Page preview
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRequested(index - 1)}
            disabled={index === 0}
            aria-label="Previous page"
            className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          >
            <ChevronRightIcon className="size-4 rotate-180" />
          </button>
          <span className="min-w-20 text-center text-sm font-medium text-foreground" aria-live="polite">
            Page {index + 1} of {images.length}
          </span>
          <button
            type="button"
            onClick={() => setRequested(index + 1)}
            disabled={index >= images.length - 1}
            aria-label="Next page"
            className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
      </div>

      <div
        className="relative bg-white shadow-md ring-1 ring-border"
        style={{ width: pageW, height: pageH }}
        role="img"
        aria-label={`Page ${index + 1} preview, ${dimensions}, showing ${image.name}`}
      >
        <div
          className="absolute overflow-hidden outline-1 outline-dashed outline-primary/30"
          style={{
            left: contentLeft,
            top: contentTop,
            width: content.width * scale,
            height: content.height * scale,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, cannot be optimized by next/image */}
          <img
            src={image.previewUrl}
            alt=""
            draggable={false}
            decoding="async"
            className="absolute max-w-none object-fill"
            style={{
              left: imgLeft,
              top: imgTop,
              width: imgW,
              height: imgH,
              transform: `rotate(${image.rotation}deg)`,
              transformOrigin: "center",
            }}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{dimensions}. Dashed line marks the margin area.</p>
    </section>
  );
}

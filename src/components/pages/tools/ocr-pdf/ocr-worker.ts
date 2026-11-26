/// <reference lib="webworker" />
import Tesseract from "tesseract.js";
import type { OcrWorkerMessage, OcrWorkerResponse } from "./ocr-types";

self.onmessage = async (e: MessageEvent<OcrWorkerMessage>) => {
  const { imageBuffer, languages, pageIndex } = e.data;

  try {
    const blob = new Blob([imageBuffer], { type: "image/png" });
    
    // Run Tesseract's OCR
    const { data } = await Tesseract.recognize(blob, languages, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          const response: OcrWorkerResponse = {
            type: "progress",
            pageIndex,
            progress: m.progress,
          };
          self.postMessage(response);
        }
      },
    });

    // Tesseract v5+ requires us to look inside the blocks to find words and bounding boxes
    const words: any[] = [];
    
    if (data.blocks) {
      for (const block of data.blocks) {
        if (block.paragraphs) {
          for (const paragraph of block.paragraphs) {
            if (paragraph.lines) {
              for (const line of paragraph.lines) {
                if (line.words) {
                  for (const word of line.words) {
                    if (word.text.trim()) {
                      words.push({
                        text: word.text,
                        bbox: {
                          x0: word.bbox.x0,
                          y0: word.bbox.y0,
                          x1: word.bbox.x1,
                          y1: word.bbox.y1,
                        },
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    const response: OcrWorkerResponse = {
      type: "success",
      pageIndex,
      words,
    };
    self.postMessage(response);
  } catch (error) {
    const response: OcrWorkerResponse = {
      type: "error",
      pageIndex,
      error: error instanceof Error ? error.message : "Worker OCR failed",
    };
    self.postMessage(response);
  }
};
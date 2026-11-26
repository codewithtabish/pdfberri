import * as pdfjsLib from "pdfjs-dist";
import type { ExtractProgress, ExtractResult } from "./extract-types";
import { countWords } from "./extract-utils";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

interface ExtractOptions {
  preserveLineBreaks: boolean;
  preservePageSeparation: boolean;
  includePageNumbers: boolean;
}

export async function extractTextFromPdf(
  file: File,
  selectedPages: number[], // 1-based array, empty means all pages
  options: ExtractOptions,
  onProgress: (progress: ExtractProgress) => void,
  signal?: AbortSignal
): Promise<ExtractResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const totalPages = pdfDoc.numPages;

  const pagesToProcess = selectedPages.length > 0 
    ? selectedPages 
    : Array.from({ length: totalPages }, (_, i) => i + 1);

  let fullText = "";
  const pagesWithText: number[] = [];
  const emptyPages: number[] = [];

  for (let i = 0; i < pagesToProcess.length; i++) {
    if (signal?.aborted) throw new Error("Processing cancelled");

    const pageNum = pagesToProcess[i];
    onProgress({
      stage: "extracting",
      currentPage: pageNum,
      totalPages: pagesToProcess.length,
      message: `Extracting page ${pageNum}...`,
      percent: Math.round((i / pagesToProcess.length) * 100),
    });

    try {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      if (textContent.items.length === 0) {
        emptyPages.push(pageNum);
        continue;
      }

      let pageText = "";
      let lastY: number | null = null;
      let lastX: number | null = null;

      for (const item of textContent.items) {
        // Cast to any to bypass PDF.js union types for text/transform
        const txtItem = item as any; 
        if (!txtItem.str) continue;

        const [ , , , , x, y] = txtItem.transform;

        if (lastY !== null && lastX !== null && options.preserveLineBreaks) {
          const yDiff = Math.abs(y - lastY);
          // Heuristic: If Y difference is large, it's a new line/paragraph
          if (yDiff > 5) { 
            // Check if it's a new paragraph (large gap)
            if (yDiff > 15) {
              pageText += "\n\n";
            } else {
              pageText += "\n";
            }
          } else if (x - lastX > 20) {
            // Heuristic: Same line, but large gap (e.g., table column)
            pageText += "  "; 
          } else {
             // Standard space between words
             pageText += " ";
          }
        }

        pageText += txtItem.str;
        lastY = y;
        lastX = x + (txtItem.width || 0);
      }

      const trimmedText = pageText.trim();
      if (trimmedText) {
        pagesWithText.push(pageNum);
        if (options.includePageNumbers) {
          fullText += `----- Page ${pageNum} -----\n\n`;
        }
        fullText += trimmedText;
        if (options.preservePageSeparation && i < pagesToProcess.length - 1) {
          fullText += "\n\n";
        }
      } else {
        emptyPages.push(pageNum);
      }

    } catch (pageError) {
      console.warn(`Failed to extract page ${pageNum}`, pageError);
      emptyPages.push(pageNum);
    }
  }

  onProgress({
    stage: "completed",
    currentPage: totalPages,
    totalPages: totalPages,
    message: "Extraction complete.",
    percent: 100,
  });

  return {
    fileName: file.name,
    fileSize: file.size,
    totalPages,
    selectedPages: pagesToProcess,
    pagesWithText,
    emptyPages,
    extractedText: fullText,
    characterCount: fullText.length,
    wordCount: countWords(fullText),
  };
}
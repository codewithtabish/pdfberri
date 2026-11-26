import type { PDFPageProxy } from 'pdfjs-dist';
import { ExtractedCell } from './pdf-to-excel-types';

export async function extractTextWithCoordinates(page: PDFPageProxy): Promise<ExtractedCell[]> {
  const textContent = await page.getTextContent();
  const cells: ExtractedCell[] = [];

  for (const item of textContent.items) {
    if ('str' in item && item.str.trim().length > 0) {
      const transform = item.transform;
      cells.push({
        // NFKC turns Arabic presentation forms into normal letters
        text: item.str.normalize('NFKC'),
        x: transform[4],
        y: transform[5],
        width: item.width,
        height: item.height,
      });
    }
  }
  return cells;
}

// Most frequent letters in Urdu/Arabic/Persian. Real text is dominated by these;
// text from a broken font mapping has an almost uniform letter distribution.
const COMMON_LETTERS = new Set('ایيرنہهوکكمےتسلبد'.split(''));
const ARABIC_LETTER_RE = /[\u0621-\u064A\u0671-\u06D3\u06FA-\u06FF]/g;

export interface TextAssessment {
  ok: boolean;
  reason: string;
}

export function assessText(text: string): TextAssessment {
  const compact = text.replace(/\s/g, '');
  if (compact.length < 20) return { ok: false, reason: 'too little text' };

  let bad = 0;
  for (const ch of compact) {
    const code = ch.codePointAt(0) ?? 0;
    if (
      code === 0xfffd ||
      code < 32 ||
      (code >= 0xe000 && code <= 0xf8ff) ||
      (code >= 0x1e00 && code <= 0x1eff)
    ) {
      bad++;
    }
  }
  if (bad / compact.length > 0.03) return { ok: false, reason: 'unmapped characters' };

  const letters = compact.match(ARABIC_LETTER_RE) ?? [];
  if (letters.length >= 30) {
    let common = 0;
    for (const l of letters) if (COMMON_LETTERS.has(l)) common++;
    if (common / letters.length < 0.45) return { ok: false, reason: 'unreadable letter pattern' };
  }

  return { ok: true, reason: '' };
}
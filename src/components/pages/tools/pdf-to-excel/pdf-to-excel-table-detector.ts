import { ExtractedCell, ExtractedTable } from './pdf-to-excel-types';

const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const SENTENCE_END_RE = /[.!?۔؟]$/;
const BLOCK_START_RE = /^([•\-*]\s|\d+[.)]\s)/;
const CODE_RE = /[{}[\]=<>]|\w\([^)]*\)|\s#\s|^#|^\s*(def|class|import|from|return|for|while|if|elif|else|print)\b/;

interface Segment {
  text: string;
  start: number;
  end: number;
}

interface Line {
  y: number;
  rtl: boolean;
  segments: Segment[];
  text: string;
  cells: ExtractedCell[]; // raw pieces of text on this line, left to right
  left: number; // x of the left edge
  height: number; // typical font height on this line
}

function isRtl(text: string): boolean {
  const arabic = text.match(ARABIC_RE)?.length ?? 0;
  const latin = text.match(/[A-Za-z]/g)?.length ?? 0;
  return arabic > latin;
}

function getMedianHeight(cells: ExtractedCell[]): number {
  const heights = cells.map((c) => c.height).filter((h) => h > 0).sort((a, b) => a - b);
  return heights[Math.floor(heights.length / 2)] || 10;
}

// items must already be in logical reading order
function joinItems(items: ExtractedCell[], rtl: boolean, medianH: number): string {
  let out = '';
  for (let k = 0; k < items.length; k++) {
    const cur = items[k];
    if (k > 0) {
      const prev = items[k - 1];
      const gap = rtl ? prev.x - (cur.x + cur.width) : cur.x - (prev.x + prev.width);
      const hasSpace = /\s$/.test(out) || /^\s/.test(cur.text);
      if (!hasSpace && gap > medianH * 0.2) out += ' ';
    }
    out += cur.text;
  }
  return out.replace(/\s+/g, ' ').trim();
}

function buildLines(cells: ExtractedCell[], medianH: number, splitColumns: boolean): Line[] {
  const sorted = [...cells].sort((a, b) => b.y - a.y);

  // Group pieces of text into lines. The tolerance depends on the height of the
  // text itself, so small fonts (code, footnotes) are not merged with the line below.
  const groups: ExtractedCell[][] = [];
  const groupMinH: number[] = [];

  for (const cell of sorted) {
    const cellH = cell.height > 0 ? cell.height : medianH;
    const gi = groups.length - 1;

    if (gi >= 0) {
      const tol = Math.max(1, 0.4 * Math.min(groupMinH[gi], cellH));
      if (Math.abs(groups[gi][0].y - cell.y) <= tol) {
        groups[gi].push(cell);
        groupMinH[gi] = Math.min(groupMinH[gi], cellH);
        continue;
      }
    }
    groups.push([cell]);
    groupMinH.push(cellH);
  }

  const gapLimit = splitColumns ? medianH * 2.5 : Infinity;

  return groups.map((group) => {
    const ordered = [...group].sort((a, b) => a.x - b.x);
    const rtl = isRtl(ordered.map((c) => c.text).join(' '));

    const chunks: ExtractedCell[][] = [];
    let prevEnd = -Infinity;
    for (const cell of ordered) {
      const cur = chunks[chunks.length - 1];
      if (cur && cell.x - prevEnd <= gapLimit) cur.push(cell);
      else chunks.push([cell]);
      prevEnd = Math.max(prevEnd, cell.x + cell.width);
    }

    let segments: Segment[] = chunks.map((items) => {
      const logical = rtl ? [...items].reverse() : items;
      return {
        text: joinItems(logical, rtl, medianH),
        start: Math.min(...items.map((i) => i.x)),
        end: Math.max(...items.map((i) => i.x + i.width)),
      };
    });
    if (rtl) segments = segments.reverse();
    segments = segments.filter((s) => s.text.length > 0);

    const heights = group.map((c) => c.height).filter((h) => h > 0).sort((a, b) => a - b);

    return {
      y: group[0].y,
      rtl,
      segments,
      text: segments.map((s) => s.text).join(' '),
      cells: ordered,
      left: ordered[0].x,
      height: heights.length ? heights[Math.floor(heights.length / 2)] : medianH,
    };
  }).filter((l) => l.segments.length > 0);
}

function buildParagraphs(lines: Line[], medianH: number, isOcr: boolean): string[] {
  // Width of each line. OCR lines have no real geometry, so text length is used instead.
  const measure = (l: Line): number => {
    if (isOcr) return l.text.length;
    const starts = l.segments.map((s) => s.start);
    const ends = l.segments.map((s) => s.end);
    return Math.max(...ends) - Math.min(...starts);
  };

  const widths = lines.map(measure).sort((a, b) => a - b);
  const reference = widths.length > 0 ? widths[Math.floor((widths.length - 1) * 0.85)] : 0;
  const isFullWidth = (l: Line) => measure(l) >= reference * 0.8;

  const out: string[] = [];
  let current = '';
  let prev: Line | null = null;
  let pendingBreak = false; // previous line was short: it may be the end of its paragraph

  const flush = () => {
    if (current) out.push(current);
    current = '';
    pendingBreak = false;
  };

  for (const line of lines) {
    const text = line.text.trim();
    if (!text) continue;

    // Code lines always keep their own row
    if (CODE_RE.test(text)) {
      flush();
      out.push(text);
      prev = line;
      continue;
    }

    const bigGap = prev !== null && prev.y - line.y > medianH * 1.8;

    // A line that starts in lowercase, with the same size and left edge as the
    // previous line, continues the previous line (wrapped heading or paragraph).
    const continuation =
      prev !== null &&
      !bigGap &&
      /^[a-z]/.test(text) &&
      Math.abs(prev.height - line.height) <= prev.height * 0.15 &&
      Math.abs(prev.left - line.left) <= medianH * 2;

    if (current && (bigGap || BLOCK_START_RE.test(text) || (pendingBreak && !continuation))) {
      flush();
    }

    current = current ? `${current} ${text}` : text;

    if (SENTENCE_END_RE.test(text)) {
      flush();
    } else {
      pendingBreak = !isFullWidth(line);
    }
    prev = line;
  }
  flush();
  return out;
}

// Right-to-left tables keep the original column detection
function buildGrid(run: Line[], medianH: number): string[][] | null {
  const rtl = run.filter((l) => l.rtl).length > run.length / 2;

  const anchors: number[] = [];
  for (const line of run) {
    for (const seg of line.segments) anchors.push(rtl ? seg.end : seg.start);
  }
  anchors.sort((a, b) => a - b);

  const tol = medianH * 2;
  const clusters: number[][] = [];
  for (const a of anchors) {
    const c = clusters[clusters.length - 1];
    if (c && a - c[c.length - 1] <= tol) c.push(a);
    else clusters.push([a]);
  }

  const centers = clusters.map((c) => c.reduce((s, v) => s + v, 0) / c.length);
  if (rtl) centers.reverse();
  if (centers.length < 2 || centers.length > 30) return null;

  return run.map((line) => {
    const row = new Array<string>(centers.length).fill('');
    for (const seg of line.segments) {
      const a = rtl ? seg.end : seg.start;
      let best = 0;
      let bestDist = Infinity;
      centers.forEach((c, idx) => {
        const d = Math.abs(c - a);
        if (d < bestDist) {
          bestDist = d;
          best = idx;
        }
      });
      row[best] = row[best] ? `${row[best]} ${seg.text}` : seg.text;
    }
    return row;
  });
}

// Left-to-right tables: x position where each column starts
function getColumnStarts(run: Line[], medianH: number): number[] | null {
  const anchors: number[] = [];
  for (const line of run) {
    for (const seg of line.segments) anchors.push(seg.start);
  }
  anchors.sort((a, b) => a - b);

  const tol = medianH * 2;
  const clusters: number[][] = [];
  for (const a of anchors) {
    const c = clusters[clusters.length - 1];
    if (c && a - c[c.length - 1] <= tol) c.push(a);
    else clusters.push([a]);
  }

  const starts = clusters.map((c) => Math.min(...c));
  if (starts.length < 2 || starts.length > 30) return null;
  return starts;
}

function assignColumns(line: Line, starts: number[], tol: number, medianH: number): string[] {
  const buckets: ExtractedCell[][] = starts.map(() => []);
  for (const cell of line.cells) {
    let col = 0;
    for (let k = 1; k < starts.length; k++) {
      if (cell.x >= starts[k] - tol) col = k;
    }
    buckets[col].push(cell);
  }
  return buckets.map((b) => (b.length > 0 ? joinItems(b, false, medianH) : ''));
}

// Builds the table from its first rows and keeps going through wrapped cell lines
function buildTableRegion(
  lines: Line[],
  start: number,
  runEnd: number,
  starts: number[],
  medianH: number
): { rows: string[][]; end: number } {
  const tol = medianH * 1.5;
  const rows: string[][] = [];
  const bodyHeight = lines[Math.min(start + 1, runEnd - 1)].height;

  let k = start;
  while (k < lines.length) {
    const line = lines[k];

    if (k > start) {
      const prev = lines[k - 1];
      if (prev.y - line.y > medianH * 3) break; // big vertical gap: table is over

      if (k >= runEnd) {
        if (line.height > bodyHeight * 1.15) break; // bigger font: a heading, not a table row
        const lineEnd = Math.max(...line.cells.map((c) => c.x + c.width));
        const onlyFirstColumn = line.cells.every((c) => c.x < starts[1] - tol);
        if (onlyFirstColumn && lineEnd > starts[1]) break; // full-width paragraph
      }
    }

    const row = assignColumns(line, starts, tol, medianH);

    if (k >= runEnd && rows.length > 1 && row[0] === '') {
      // Nothing in the first column: this is a wrapped line of the cell above
      const last = rows[rows.length - 1];
      row.forEach((text, c) => {
        if (text) last[c] = last[c] ? `${last[c]} ${text}` : text;
      });
    } else {
      rows.push(row);
    }
    k++;
  }

  return { rows, end: k };
}

export function detectTablesFromCells(
  cells: ExtractedCell[],
  pageNumber: number,
  method: ExtractedTable['extractionMethod'] = 'text-layer'
): ExtractedTable[] {
  const clean = cells.filter((c) => c.text.trim().length > 0);
  if (clean.length === 0) return [];

  const isOcr = method === 'ocr';
  const medianH = getMedianHeight(clean);
  const lines = buildLines(clean, medianH, !isOcr);

  const tables: ExtractedTable[] = [];
  let textBuffer: Line[] = [];
  let counter = 0;

  const flushText = () => {
    if (textBuffer.length === 0) return;
    const paragraphs = buildParagraphs(textBuffer, medianH, isOcr);
    textBuffer = [];
    if (paragraphs.length === 0) return;
    counter++;
    tables.push({
      id: `table-${pageNumber}-${counter}`,
      pageNumber,
      confidence: isOcr ? 'medium' : 'high',
      headers: ['Content'],
      rows: paragraphs.map((p) => [p]),
      extractionMethod: method,
      warnings: [],
    });
  };

  let i = 0;
  while (i < lines.length) {
    if (!isOcr && lines[i].segments.length >= 2) {
      let j = i;
      while (j < lines.length && lines[j].segments.length >= 2) j++;

      if (j - i >= 2) {
        const run = lines.slice(i, j);
        const rtl = run.filter((l) => l.rtl).length > run.length / 2;

        let grid: string[][] | null = null;
        let end = j;

        if (rtl) {
          grid = buildGrid(run, medianH);
        } else {
          const starts = getColumnStarts(run, medianH);
          if (starts) {
            const region = buildTableRegion(lines, i, j, starts, medianH);
            grid = region.rows;
            end = region.end;
          }
        }

        if (grid && grid.length > 0) {
          flushText();
          counter++;
          tables.push({
            id: `table-${pageNumber}-${counter}`,
            pageNumber,
            confidence: 'medium',
            headers: grid[0],
            rows: grid.slice(1),
            extractionMethod: method,
            warnings: [],
          });
          i = end;
          continue;
        }
      }
    }
    textBuffer.push(lines[i]);
    i++;
  }
  flushText();

  return tables;
}
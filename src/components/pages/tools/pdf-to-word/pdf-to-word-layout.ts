// src/components/pages/tools/pdf-to-word/pdf-to-word-layout.ts
//
// Turns positioned text items into document blocks (paragraphs, tables, columns).
// This is heuristic reconstruction: PDFs do not store paragraphs or tables.

import type {
  Block,
  ColumnsBlock,
  ConversionMode,
  ImageBlock,
  PageContent,
  PageFlow,
  PageImage,
  ParagraphBlock,
  RawItem,
  RunningContent,
  StyledRun,
  TableBlock,
  TextAlign,
} from "./pdf-to-word-types";

const SEGMENT_GAP_EM = 1.8;

interface Segment {
  x: number;
  xEnd: number;
  runs: StyledRun[];
  text: string;
}

interface Line {
  baseline: number;
  size: number;
  x: number;
  xEnd: number;
  segments: Segment[];
  text: string;
  rtl: boolean;
}

interface Bounds {
  left: number;
  right: number;
}

export interface LayoutContext {
  bodySize: number;
  running: RunningContent;
}

export function emptyRunning(): RunningContent {
  return {
    removal: new Map(),
    header: null,
    footer: null,
    footerPageNumber: false,
  };
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

// ------------------------------------------------------------
// Document-level statistics
// ------------------------------------------------------------

export function computeBodySize(pages: PageContent[]): number {
  const weights = new Map<number, number>();
  for (const page of pages) {
    for (const item of page.items) {
      const key = Math.round(item.size * 2) / 2;
      weights.set(key, (weights.get(key) ?? 0) + item.text.length);
    }
  }
  let best = 11;
  let bestWeight = 0;
  for (const [size, weight] of weights) {
    if (weight > bestWeight) {
      best = size;
      bestWeight = weight;
    }
  }
  return best;
}

// ------------------------------------------------------------
// Running headers / footers (editable mode only)
// ------------------------------------------------------------

function zoneOf(baseline: number, height: number): "top" | "bottom" | null {
  if (baseline < height * 0.09) return "top";
  if (baseline > height * 0.92) return "bottom";
  return null;
}

function normalizeKey(text: string): string {
  return text.trim().toLowerCase().replace(/\d+/g, "#").replace(/\s+/g, " ");
}

export function detectRunningContent(pages: PageContent[]): RunningContent {
  const result = emptyRunning();
  if (pages.length < 3) return result;

  const stats = new Map<
    string,
    {
      pages: Set<number>;
      texts: Set<string>;
      zone: "top" | "bottom";
      x: number;
      text: string;
    }
  >();

  for (const page of pages) {
    for (const item of page.items) {
      const zone = zoneOf(item.baseline, page.height);
      if (!zone) continue;
      const key = `${zone}|${normalizeKey(item.text)}`;
      let st = stats.get(key);
      if (!st) {
        st = {
          pages: new Set(),
          texts: new Set(),
          zone,
          x: item.x,
          text: item.text.trim(),
        };
        stats.set(key, st);
      }
      st.pages.add(page.pageNumber);
      st.texts.add(item.text.trim());
    }
  }

  const threshold = Math.max(3, Math.ceil(pages.length * 0.5));
  const headers: Array<{ x: number; text: string }> = [];
  const footers: Array<{ x: number; text: string }> = [];

  for (const [key, st] of stats) {
    if (st.pages.size < threshold) continue;
    const normalized = key.slice(key.indexOf("|") + 1);
    if (st.texts.size === 1) {
      result.removal.set(key, "static");
      (st.zone === "top" ? headers : footers).push({ x: st.x, text: st.text });
    } else if (normalized === "#") {
      result.removal.set(key, "page");
      if (st.zone === "bottom") result.footerPageNumber = true;
    }
  }

  const join = (list: Array<{ x: number; text: string }>) =>
    list.length
      ? list
          .sort((a, b) => a.x - b.x)
          .map((e) => e.text)
          .join("   ")
      : null;
  result.header = join(headers);
  result.footer = join(footers);
  return result;
}

function filterRunningItems(
  items: RawItem[],
  height: number,
  running: RunningContent,
): RawItem[] {
  if (running.removal.size === 0) return items;
  return items.filter((item) => {
    const zone = zoneOf(item.baseline, height);
    if (!zone) return true;
    return !running.removal.has(`${zone}|${normalizeKey(item.text)}`);
  });
}

// ------------------------------------------------------------
// Items -> lines -> segments
// ------------------------------------------------------------

function sameStyle(run: StyledRun, item: RawItem): boolean {
  return (
    run.bold === item.bold &&
    run.italic === item.italic &&
    Math.abs(run.size - item.size) < 0.6 &&
    run.font === item.font
  );
}

function appendItem(seg: Segment, item: RawItem) {
  const last = seg.runs[seg.runs.length - 1];
  if (last && sameStyle(last, item)) {
    last.text += item.text;
  } else {
    seg.runs.push({
      text: item.text,
      bold: item.bold,
      italic: item.italic,
      size: item.size,
      font: item.font,
    });
  }
  seg.text += item.text;
  seg.xEnd = Math.max(seg.xEnd, item.xEnd);
}

function appendSpace(seg: Segment) {
  const last = seg.runs[seg.runs.length - 1];
  if (last) last.text += " ";
  seg.text += " ";
}

function needsSpace(prev: RawItem, item: RawItem): boolean {
  const gap = item.x - prev.xEnd;
  return (
    gap > 0.12 * item.size && !/\s$/.test(prev.text) && !/^\s/.test(item.text)
  );
}

function makeSegment(asc: RawItem[], rtl: boolean): Segment {
  const spaces = asc.map((item, i) => i > 0 && needsSpace(asc[i - 1], item));
  const order = asc.map((_, i) => i);
  if (rtl) order.reverse();

  const seg: Segment = {
    x: asc[0].x,
    xEnd: asc[0].xEnd,
    runs: [],
    text: "",
  };
  order.forEach((idx, pos) => {
    if (pos > 0) {
      const between = rtl ? spaces[order[pos - 1]] : spaces[idx];
      if (between) appendSpace(seg);
    }
    appendItem(seg, asc[idx]);
  });
  return seg;
}

function dominantSize(items: RawItem[]): number {
  const weights = new Map<number, number>();
  for (const it of items) {
    const key = Math.round(it.size * 2) / 2;
    weights.set(key, (weights.get(key) ?? 0) + it.text.length);
  }
  let best = items[0].size;
  let bestWeight = -1;
  for (const [size, weight] of weights) {
    if (weight > bestWeight) {
      best = size;
      bestWeight = weight;
    }
  }
  return best;
}

function groupToLine(group: RawItem[]): Line {
  const asc = [...group].sort((a, b) => a.x - b.x);
  const rtlWeight = asc.reduce(
    (s, it) => s + (it.rtl ? it.text.length : -it.text.length),
    0,
  );
  const rtl = rtlWeight > 0;

  const chunks: RawItem[][] = [];
  let current: RawItem[] = [];
  for (const item of asc) {
    const prev = current[current.length - 1];
    if (
      prev &&
      item.x - prev.xEnd > SEGMENT_GAP_EM * Math.max(prev.size, item.size)
    ) {
      chunks.push(current);
      current = [];
    }
    current.push(item);
  }
  if (current.length) chunks.push(current);

  const segments = chunks.map((chunk) => makeSegment(chunk, rtl));
  if (rtl) segments.reverse();

  const baseline = group.reduce((s, it) => s + it.baseline, 0) / group.length;
  const ordered = [...segments].sort((a, b) => a.x - b.x);
  return {
    baseline,
    size: dominantSize(group),
    x: ordered[0].x,
    xEnd: Math.max(...segments.map((s) => s.xEnd)),
    segments,
    text: segments.map((s) => s.text).join(" "),
    rtl,
  };
}

function buildLines(items: RawItem[]): Line[] {
  if (items.length === 0) return [];
  const sorted = [...items].sort(
    (a, b) => a.baseline - b.baseline || a.x - b.x,
  );
  const groups: RawItem[][] = [];
  let current: RawItem[] = [];
  let ref = 0;
  for (const item of sorted) {
    if (current.length === 0) {
      current = [item];
      ref = item.baseline;
      continue;
    }
    if (Math.abs(item.baseline - ref) <= Math.max(1.5, item.size * 0.4)) {
      current.push(item);
    } else {
      groups.push(current);
      current = [item];
      ref = item.baseline;
    }
  }
  if (current.length) groups.push(current);
  return groups.map(groupToLine);
}

function flowBounds(lines: Line[]): Bounds {
  if (lines.length === 0) return { left: 0, right: 0 };
  const significant = lines.filter((l) => l.text.trim().length >= 12);
  const source = significant.length ? significant : lines;
  return {
    left: Math.min(...source.map((l) => l.x)),
    right: Math.max(...source.map((l) => l.xEnd)),
  };
}

// ------------------------------------------------------------
// Tables
// ------------------------------------------------------------

type Chunk =
  | { kind: "line"; line: Line }
  | { kind: "table"; rows: Line[] };

const spread = (values: number[]) => Math.max(...values) - Math.min(...values);

function rowsAreAligned(rows: Line[]): boolean {
  const n = rows[0].segments.length;
  const tol = Math.max(6, rows[0].size * 0.7);
  for (let c = 0; c < n; c += 1) {
    const xs = rows.map((r) => r.segments[c].x);
    const es = rows.map((r) => r.segments[c].xEnd);
    const cs = rows.map((r) => (r.segments[c].x + r.segments[c].xEnd) / 2);
    if (Math.min(spread(xs), spread(es), spread(cs)) > tol) return false;
  }
  return true;
}

function groupTables(lines: Line[]): Chunk[] {
  const chunks: Chunk[] = [];
  let i = 0;
  while (i < lines.length) {
    const first = lines[i];
    const n = first.segments.length;
    if (n >= 2 && n <= 8 && !first.rtl) {
      let j = i + 1;
      while (
        j < lines.length &&
        lines[j].segments.length === n &&
        !lines[j].rtl &&
        lines[j].baseline - lines[j - 1].baseline <=
          3.2 * Math.max(lines[j].size, lines[j - 1].size)
      ) {
        j += 1;
      }
      const rows = lines.slice(i, j);
      if (rows.length >= 2 && rowsAreAligned(rows)) {
        chunks.push({ kind: "table", rows });
        i = j;
        continue;
      }
    }
    chunks.push({ kind: "line", line: first });
    i += 1;
  }
  return chunks;
}

function toTableBlock(rows: Line[]): TableBlock {
  const n = rows[0].segments.length;
  const tol = Math.max(6, rows[0].size * 0.7);
  const colX = Array.from({ length: n }, (_, c) =>
    Math.min(...rows.map((r) => r.segments[c].x)),
  );
  const colEnd = Array.from({ length: n }, (_, c) =>
    Math.max(...rows.map((r) => r.segments[c].xEnd)),
  );
  const colWidths = colX.map((x, c) =>
    c < n - 1 ? colX[c + 1] - x : colEnd[c] - x + 10,
  );

  const aligns: TextAlign[] = colX.map((_, c) => {
    const xs = rows.map((r) => r.segments[c].x);
    const es = rows.map((r) => r.segments[c].xEnd);
    return spread(es) <= tol && spread(xs) > tol ? "right" : "left";
  });

  const last = rows[rows.length - 1];
  return {
    type: "table",
    x: colX[0],
    xEnd: colEnd[n - 1],
    top: rows[0].baseline - rows[0].size * 0.96,
    bottom: last.baseline + last.size * 0.4,
    colWidths,
    rows: rows.map((row) =>
      row.segments.map((seg, c) => ({
        runs: seg.runs.map((r) => ({ ...r })),
        align: aligns[c],
      })),
    ),
  };
}

// ------------------------------------------------------------
// Runs helpers
// ------------------------------------------------------------

function lineRuns(line: Line, mode: ConversionMode): StyledRun[] {
  const out: StyledRun[] = [];
  line.segments.forEach((seg, i) => {
    if (i > 0) {
      const prev = line.segments[i - 1];
      const gap = Math.abs(seg.x - prev.xEnd);
      const count =
        mode === "layout"
          ? clamp(Math.round(gap / (line.size * 0.27)), 1, 80)
          : 3;
      const ref = out[out.length - 1] ?? seg.runs[0];
      out.push({ ...ref, text: " ".repeat(count) });
    }
    for (const run of seg.runs) out.push({ ...run });
  });
  return out;
}

function trimRuns(runs: StyledRun[]): StyledRun[] {
  const copy = runs.map((r) => ({ ...r }));
  while (copy.length && !copy[0].text.trimStart()) copy.shift();
  while (copy.length && !copy[copy.length - 1].text.trimEnd()) copy.pop();
  if (copy.length) {
    copy[0].text = copy[0].text.trimStart();
    copy[copy.length - 1].text = copy[copy.length - 1].text.trimEnd();
  }
  return copy.filter((r) => r.text.length > 0);
}

// ------------------------------------------------------------
// Layout mode: one paragraph per source line
// ------------------------------------------------------------

function lineParagraph(line: Line, bounds: Bounds): ParagraphBlock | null {
  const runs = trimRuns(lineRuns(line, "layout"));
  if (runs.length === 0) return null;

  const width = bounds.right - bounds.left;
  const mid = (bounds.left + bounds.right) / 2;
  const center = (line.x + line.xEnd) / 2;
  let align: TextAlign = "left";
  if (width > 0) {
    if (
      Math.abs(center - mid) <= width * 0.02 + 2 &&
      line.x - bounds.left > width * 0.08 &&
      bounds.right - line.xEnd > width * 0.08
    ) {
      align = "center";
    } else if (
      line.xEnd >= bounds.right - 2 &&
      line.x > bounds.left + width * 0.4
    ) {
      align = "right";
    }
  }

  return {
    type: "paragraph",
    runs,
    x: line.x,
    xEnd: line.xEnd,
    top: line.baseline - line.size * 0.96,
    bottom: line.baseline + line.size * 0.24,
    size: line.size,
    align,
    heading: 0,
    indent: 0,
    rtl: line.rtl,
  };
}

function layoutBlocks(lines: Line[], bounds: Bounds): Block[] {
  const blocks: Block[] = [];
  for (const chunk of groupTables(lines)) {
    if (chunk.kind === "table") {
      blocks.push(toTableBlock(chunk.rows));
    } else {
      const p = lineParagraph(chunk.line, bounds);
      if (p) blocks.push(p);
    }
  }
  return blocks;
}

// ------------------------------------------------------------
// Editable mode: paragraphs, headings, lists
// ------------------------------------------------------------

const LIST_START_RE =
  /^\s*(?:[•·▪◦●■□○‣⁃–—-]|\*|\(?\d{1,3}[.)]|\(?[a-zA-Z][.)]|\(?[ivxlcdm]{1,5}[.)])\s+\S/;

function isListStart(line: Line): boolean {
  return LIST_START_RE.test(line.text);
}

function headingLevel(line: Line, bodySize: number): 0 | 1 | 2 | 3 {
  const text = line.text.trim();
  if (!text || text.length > 140) return 0;
  const ratio = line.size / bodySize;
  if (ratio >= 1.7) return 1;
  if (ratio >= 1.4) return 2;
  if (ratio >= 1.15) return 3;
  const allBold =
    line.segments.length === 1 &&
    line.segments.every((s) => s.runs.every((r) => r.bold));
  if (allBold && ratio >= 0.95 && text.length <= 90 && !/[.,;:]$/.test(text)) {
    return 3;
  }
  return 0;
}

function shouldBreak(
  prev: Line,
  line: Line,
  current: Line[],
  bounds: Bounds,
  bodySize: number,
): boolean {
  const pitch = line.baseline - prev.baseline;
  const size = Math.max(prev.size, line.size);
  if (pitch > size * 1.6 || pitch < -1) return true;
  if (Math.abs(prev.size - line.size) > Math.max(1.2, prev.size * 0.12)) {
    return true;
  }
  if (
    (headingLevel(prev, bodySize) > 0) !== (headingLevel(line, bodySize) > 0)
  ) {
    return true;
  }
  if (isListStart(line)) return true;

  const inList = isListStart(current[0]);
  if (!inList && line.x > prev.x + size * 0.8) return true;
  if (inList && line.x < current[0].x - 1) return true;

  const width = bounds.right - bounds.left;
  if (width > 0) {
    if (prev.xEnd < bounds.left + width * 0.6) return true;
    if (
      prev.xEnd < bounds.left + width * 0.78 &&
      /[.!?:;"”’)\]]\s*$/.test(prev.text.trim())
    ) {
      return true;
    }
  }
  return false;
}

function joinLinesRuns(lines: Line[]): StyledRun[] {
  const out: StyledRun[] = [];
  lines.forEach((line, idx) => {
    const runs = lineRuns(line, "editable");
    if (idx > 0 && out.length && runs.length) {
      const last = out[out.length - 1];
      const prevText = last.text.trimEnd();
      const next = runs[0].text.trimStart();
      if (
        !line.rtl &&
        /[A-Za-z\u00C0-\u024F]-$/.test(prevText) &&
        /^\p{Ll}/u.test(next)
      ) {
        last.text = prevText.slice(0, -1);
        runs[0] = { ...runs[0], text: next };
      } else if (!/\s$/.test(last.text)) {
        last.text += " ";
      }
    }
    out.push(...runs);
  });
  return out;
}

function paragraphAlign(group: Line[], bounds: Bounds): TextAlign {
  const width = bounds.right - bounds.left;
  if (width <= 0) return "left";
  const mid = (bounds.left + bounds.right) / 2;
  const centered = group.every(
    (l) =>
      Math.abs((l.x + l.xEnd) / 2 - mid) <= width * 0.03 + 2 &&
      l.x - bounds.left > width * 0.06,
  );
  if (centered) return "center";
  if (
    group.length === 1 &&
    group[0].xEnd >= bounds.right - 3 &&
    group[0].x > bounds.left + width * 0.5
  ) {
    return "right";
  }
  return "left";
}

function paragraphFromLines(
  group: Line[],
  bounds: Bounds,
  bodySize: number,
): ParagraphBlock | null {
  const first = group[0];
  const last = group[group.length - 1];
  let runs = joinLinesRuns(group);

  if (isListStart(first) && runs.length) {
    runs[0] = {
      ...runs[0],
      text: runs[0].text.replace(/^\s*[·▪◦●■□○‣⁃*]\s*/, "• "),
    };
  }
  runs = trimRuns(runs);
  if (runs.length === 0) return null;

  const align = paragraphAlign(group, bounds);
  let indent = align === "left" ? Math.max(0, first.x - bounds.left) : 0;
  if (indent < first.size * 0.8) indent = 0;

  return {
    type: "paragraph",
    runs,
    x: first.x,
    xEnd: Math.max(...group.map((l) => l.xEnd)),
    top: first.baseline - first.size * 0.96,
    bottom: last.baseline + last.size * 0.24,
    size: first.size,
    align,
    heading: headingLevel(first, bodySize),
    indent,
    rtl: group.some((l) => l.rtl),
  };
}

function editableBlocks(
  lines: Line[],
  bounds: Bounds,
  bodySize: number,
): Block[] {
  const blocks: Block[] = [];
  let pending: Line[] = [];

  const flush = () => {
    if (pending.length === 0) return;
    const groups: Line[][] = [];
    let current: Line[] = [];
    for (const line of pending) {
      if (current.length === 0) {
        current = [line];
        continue;
      }
      if (
        shouldBreak(
          current[current.length - 1],
          line,
          current,
          bounds,
          bodySize,
        )
      ) {
        groups.push(current);
        current = [line];
      } else {
        current.push(line);
      }
    }
    if (current.length) groups.push(current);
    for (const group of groups) {
      const p = paragraphFromLines(group, bounds, bodySize);
      if (p) blocks.push(p);
    }
    pending = [];
  };

  for (const chunk of groupTables(lines)) {
    if (chunk.kind === "line") {
      pending.push(chunk.line);
    } else {
      flush();
      blocks.push(toTableBlock(chunk.rows));
    }
  }
  flush();
  return blocks;
}

// ------------------------------------------------------------
// Flows (single column) and column pages
// ------------------------------------------------------------

function imageBlock(img: PageImage): ImageBlock {
  return {
    type: "image",
    x: img.x,
    xEnd: img.x + img.width,
    top: img.y,
    bottom: img.y + img.height,
    width: img.width,
    height: img.height,
    data: img.data,
    kind: img.kind,
  };
}

function buildFlow(
  items: RawItem[],
  images: PageImage[],
  mode: ConversionMode,
  ctx: LayoutContext,
): Block[] {
  const lines = buildLines(items);
  const bounds = flowBounds(lines);
  const blocks =
    mode === "layout"
      ? layoutBlocks(lines, bounds)
      : editableBlocks(lines, bounds, ctx.bodySize);
  for (const img of images) blocks.push(imageBlock(img));
  return blocks.sort((a, b) => a.top - b.top);
}

function detectGutter(items: RawItem[], pageWidth: number): number | null {
  if (items.length < 16) return null;
  const wideLimit = pageWidth * 0.62;
  const narrow = items.filter((i) => i.xEnd - i.x <= wideLimit);
  if (items.length - narrow.length > items.length * 0.25) return null;

  let best: { start: number; end: number } | null = null;
  let runStart: number | null = null;
  for (let x = pageWidth * 0.3; x <= pageWidth * 0.7; x += 2) {
    const crossing = narrow.some((i) => i.x < x && i.xEnd > x);
    if (crossing) {
      runStart = null;
      continue;
    }
    if (runStart === null) runStart = x;
    if (!best || x - runStart > best.end - best.start) {
      best = { start: runStart, end: x };
    }
  }
  if (!best || best.end - best.start < 8) return null;
  const gutter = (best.start + best.end) / 2;

  const left = narrow.filter((i) => i.xEnd <= gutter);
  const right = narrow.filter((i) => i.x >= gutter);
  if (left.length < 8 || right.length < 8) return null;

  const medianLength = (list: RawItem[]) =>
    [...list].map((i) => i.text.length).sort((a, b) => a - b)[
      Math.floor(list.length / 2)
    ];
  if (medianLength(left) < 25 || medianLength(right) < 25) return null;

  const range = (list: RawItem[]) => [
    Math.min(...list.map((i) => i.baseline)),
    Math.max(...list.map((i) => i.baseline)),
  ];
  const [l0, l1] = range(left);
  const [r0, r1] = range(right);
  const overlap = Math.min(l1, r1) - Math.max(l0, r0);
  if (overlap < 0.5 * Math.min(l1 - l0, r1 - r0)) return null;

  return gutter;
}

function columnsBlock(left: Block[], right: Block[]): ColumnsBlock {
  const lx = Math.min(...left.map((b) => b.x));
  const rx = Math.min(...right.map((b) => b.x));
  const rEnd = Math.max(...right.map((b) => b.xEnd));
  const all = [...left, ...right];
  return {
    type: "columns",
    x: lx,
    xEnd: rEnd,
    top: Math.min(...all.map((b) => b.top)),
    bottom: Math.max(...all.map((b) => b.bottom)),
    columnX: [lx, rx],
    columnWidths: [rx - lx, rEnd - rx + 4],
    columns: [left, right],
  };
}

function buildColumnFlow(
  items: RawItem[],
  images: PageImage[],
  gutter: number,
  mode: ConversionMode,
  ctx: LayoutContext,
): Block[] {
  const side = (x: number, xEnd: number): "L" | "R" | "X" =>
    xEnd <= gutter + 1.5 ? "L" : x >= gutter - 1.5 ? "R" : "X";

  const groups = { L: [] as RawItem[], R: [] as RawItem[], X: [] as RawItem[] };
  for (const item of items) groups[side(item.x, item.xEnd)].push(item);

  const imageGroups = {
    L: [] as PageImage[],
    R: [] as PageImage[],
    X: [] as PageImage[],
  };
  for (const img of images) imageGroups[side(img.x, img.x + img.width)].push(img);

  const crossBlocks = buildFlow(groups.X, imageGroups.X, mode, ctx);
  const bandOf = (bottom: number) =>
    crossBlocks.filter((b) => b.bottom <= bottom + 0.5).length;

  const bands = Array.from({ length: crossBlocks.length + 1 }, () => ({
    leftItems: [] as RawItem[],
    rightItems: [] as RawItem[],
    leftImages: [] as PageImage[],
    rightImages: [] as PageImage[],
  }));
  for (const item of groups.L) bands[bandOf(item.baseline)].leftItems.push(item);
  for (const item of groups.R) bands[bandOf(item.baseline)].rightItems.push(item);
  for (const img of imageGroups.L) {
    bands[bandOf(img.y + img.height)].leftImages.push(img);
  }
  for (const img of imageGroups.R) {
    bands[bandOf(img.y + img.height)].rightImages.push(img);
  }

  const out: Block[] = [];
  bands.forEach((band, i) => {
    const left = buildFlow(band.leftItems, band.leftImages, mode, ctx);
    const right = buildFlow(band.rightItems, band.rightImages, mode, ctx);
    if (mode === "layout" && left.length && right.length) {
      out.push(columnsBlock(left, right));
    } else {
      out.push(...left, ...right);
    }
    if (i < crossBlocks.length) out.push(crossBlocks[i]);
  });
  return out;
}

export function buildPageFlow(
  page: PageContent,
  mode: ConversionMode,
  ctx: LayoutContext,
): PageFlow {
  const items =
    mode === "editable"
      ? filterRunningItems(page.items, page.height, ctx.running)
      : page.items;
  const gutter = detectGutter(items, page.width);
  const blocks =
    gutter === null
      ? buildFlow(items, page.images, mode, ctx)
      : buildColumnFlow(items, page.images, gutter, mode, ctx);
  return { width: page.width, height: page.height, blocks };
}
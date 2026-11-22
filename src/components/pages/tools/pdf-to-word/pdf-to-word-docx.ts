// src/components/pages/tools/pdf-to-word/pdf-to-word-docx.ts

import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  LineRuleType,
  Packer,
  PageNumber,
  Paragraph,
  SectionType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
  type ISectionOptions,
} from "docx";
import JSZip from "jszip";
import { DOCX_MIME } from "./pdf-to-word-constants";
import {
  ConversionError,
  type Block,
  type ConversionMode,
  type PageFlow,
  type ParagraphBlock,
  type RunningContent,
  type StyledRun,
  type TableBlock,
  type TextAlign,
} from "./pdf-to-word-types";
import { isRtlText } from "./pdf-to-word-utils";

type DocxChild = Paragraph | Table;

const tw = (pt: number) => Math.max(0, Math.round(pt * 20));
const halfPt = (pt: number) => Math.min(400, Math.max(2, Math.round(pt * 2)));
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

// ------------------------------------------------------------
// Fonts and runs
// ------------------------------------------------------------

const FONT_RULES: Array<[RegExp, string]> = [
  [/times|serif$/i, "Times New Roman"],
  [/arial|helvetica|sans-serif/i, "Arial"],
  [/courier|mono/i, "Courier New"],
  [/calibri/i, "Calibri"],
  [/cambria/i, "Cambria"],
  [/georgia/i, "Georgia"],
  [/verdana/i, "Verdana"],
  [/tahoma/i, "Tahoma"],
  [/segoe/i, "Segoe UI"],
  [/garamond/i, "Garamond"],
  [/palatino/i, "Palatino Linotype"],
  [/consolas/i, "Consolas"],
];

function wordFont(font: string | null): string {
  if (!font) return "Arial";
  const cleaned = font.replace(/^[A-Z]{6}\+/, "");
  for (const [re, name] of FONT_RULES) {
    if (re.test(cleaned)) return name;
  }
  if (/^g_d\d+_f\d+$/i.test(cleaned) || cleaned.length < 2) return "Arial";
  const base = cleaned.split(/[-,]/)[0].replace(/(MT|PS)$/i, "");
  const spaced = base.replace(/([a-z])([A-Z])/g, "$1 $2").trim();
  return /^[\p{L}\p{N} ]{2,40}$/u.test(spaced) ? spaced : "Arial";
}

function toTextRuns(runs: StyledRun[]): TextRun[] {
  return runs
    .filter((r) => r.text.length > 0)
    .map(
      (r) =>
        new TextRun({
          text: r.text,
          bold: r.bold || undefined,
          italics: r.italic || undefined,
          size: halfPt(r.size),
          font: wordFont(r.font),
          rightToLeft: isRtlText(r.text) || undefined,
        }),
    );
}

const ALIGN: Record<TextAlign, (typeof AlignmentType)[keyof typeof AlignmentType]> =
  {
    left: AlignmentType.LEFT,
    center: AlignmentType.CENTER,
    right: AlignmentType.RIGHT,
  };

function paragraphAlignment(block: ParagraphBlock) {
  if (block.rtl) {
    return block.align === "center" ? AlignmentType.CENTER : AlignmentType.START;
  }
  return ALIGN[block.align];
}

const HEADINGS = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
} as const;

// ------------------------------------------------------------
// Blocks -> docx children
// ------------------------------------------------------------

interface Env {
  mode: ConversionMode;
  refX: number;
  contentWidth: number;
  startTop: number;
}

function spacer(heightPt: number): Paragraph {
  return new Paragraph({
    children: [],
    spacing: {
      before: 0,
      after: 0,
      line: Math.max(20, tw(heightPt)),
      lineRule: LineRuleType.EXACT,
    },
  });
}

const THIN_BORDER = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "auto" };

function paragraphToDocx(
  block: ParagraphBlock,
  env: Env,
  before: number,
): Paragraph {
  const children = toTextRuns(block.runs);

  if (env.mode === "layout") {
    const left =
      block.align === "left" && !block.rtl ? tw(block.x - env.refX) : 0;
    return new Paragraph({
      children,
      alignment: paragraphAlignment(block),
      bidirectional: block.rtl || undefined,
      spacing: {
        before: Math.min(tw(before), 31000),
        after: 0,
        line: tw(block.size * 1.2),
        lineRule: LineRuleType.EXACT,
      },
      indent: left > 0 ? { left } : undefined,
    });
  }

  const heading = block.heading ? HEADINGS[block.heading] : undefined;
  const indent =
    block.indent > 0 && !block.rtl ? tw(Math.min(block.indent, 240)) : 0;
  return new Paragraph({
    children,
    heading,
    keepNext: block.heading > 0 || undefined,
    alignment: paragraphAlignment(block),
    bidirectional: block.rtl || undefined,
    spacing: heading
      ? { before: 240, after: 120, line: 276, lineRule: LineRuleType.AUTO }
      : { before: 0, after: 120, line: 276, lineRule: LineRuleType.AUTO },
    indent: indent > 0 ? { left: indent } : undefined,
  });
}

function tableToDocx(block: TableBlock, env: Env): Table {
  let widths = block.colWidths.map((w) => Math.max(20, w));
  const total = widths.reduce((a, b) => a + b, 0);
  if (env.mode === "editable" && total > env.contentWidth) {
    const ratio = env.contentWidth / total;
    widths = widths.map((w) => w * ratio);
  }
  const indent = env.mode === "layout" ? tw(block.x - env.refX) : 0;

  return new Table({
    width: { size: tw(widths.reduce((a, b) => a + b, 0)), type: WidthType.DXA },
    columnWidths: widths.map(tw),
    layout: TableLayoutType.FIXED,
    indent: indent > 0 ? { size: indent, type: WidthType.DXA } : undefined,
    borders: {
      top: THIN_BORDER,
      bottom: THIN_BORDER,
      left: THIN_BORDER,
      right: THIN_BORDER,
      insideHorizontal: THIN_BORDER,
      insideVertical: THIN_BORDER,
    },
    rows: block.rows.map(
      (row) =>
        new TableRow({
          children: row.map(
            (cell, c) =>
              new TableCell({
                width: { size: tw(widths[c] ?? 40), type: WidthType.DXA },
                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                children: [
                  new Paragraph({
                    children: toTextRuns(cell.runs),
                    alignment: ALIGN[cell.align],
                    spacing: { before: 0, after: 0 },
                  }),
                ],
              }),
          ),
        }),
    ),
  });
}

function columnsToDocx(
  block: Extract<Block, { type: "columns" }>,
  env: Env,
): Table {
  return new Table({
    width: {
      size: tw(block.columnWidths.reduce((a, b) => a + b, 0)),
      type: WidthType.DXA,
    },
    columnWidths: block.columnWidths.map(tw),
    layout: TableLayoutType.FIXED,
    indent: { size: tw(block.x - env.refX), type: WidthType.DXA },
    borders: {
      top: NO_BORDER,
      bottom: NO_BORDER,
      left: NO_BORDER,
      right: NO_BORDER,
      insideHorizontal: NO_BORDER,
      insideVertical: NO_BORDER,
    },
    rows: [
      new TableRow({
        children: block.columns.map(
          (col, i) =>
            new TableCell({
              width: { size: tw(block.columnWidths[i]), type: WidthType.DXA },
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              children: blocksToChildren(col, {
                mode: "layout",
                refX: block.columnX[i],
                contentWidth: block.columnWidths[i],
                startTop: block.top,
              }),
            }),
        ),
      }),
    ],
  });
}

function blocksToChildren(blocks: Block[], env: Env): DocxChild[] {
  const out: DocxChild[] = [];
  let prevBottom = env.startTop;
  let prevWasTable = false;

  for (const block of blocks) {
    const before =
      env.mode === "layout" ? Math.max(0, block.top - prevBottom) : 0;

    if (block.type === "paragraph") {
      out.push(paragraphToDocx(block, env, before));
      prevWasTable = false;
    } else if (block.type === "image") {
      let w = block.width;
      let h = block.height;
      if (env.mode === "editable" && w > env.contentWidth) {
        h = (h * env.contentWidth) / w;
        w = env.contentWidth;
      }
      const left = env.mode === "layout" ? tw(block.x - env.refX) : 0;
      out.push(
        new Paragraph({
          spacing: { before: Math.min(tw(before), 31000), after: 0 },
          indent: left > 0 ? { left } : undefined,
          children: [
            new ImageRun({
              type: block.kind,
              data: block.data,
              transformation: {
                width: Math.max(1, Math.round((w * 96) / 72)),
                height: Math.max(1, Math.round((h * 96) / 72)),
              },
              altText: {
                title: "Image",
                description: "Image from the original PDF",
                name: "pdf-image",
              },
            }),
          ],
        }),
      );
      prevWasTable = false;
    } else {
      if (prevWasTable) out.push(spacer(2));
      else if (before >= 1) out.push(spacer(before));
      out.push(
        block.type === "table"
          ? tableToDocx(block, env)
          : columnsToDocx(block, env),
      );
      prevWasTable = true;
    }
    prevBottom = block.bottom;
  }

  if (out.length === 0 || out[out.length - 1] instanceof Table) {
    out.push(spacer(1));
  }
  return out;
}

// ------------------------------------------------------------
// Stats
// ------------------------------------------------------------

interface Counts {
  paragraphs: number;
  tables: number;
  images: number;
  chars: number;
}

const visibleLength = (text: string) => text.replace(/\s/g, "").length;

function countBlocks(blocks: Block[], counts: Counts) {
  for (const block of blocks) {
    if (block.type === "paragraph") {
      counts.paragraphs += 1;
      counts.chars += block.runs.reduce((s, r) => s + visibleLength(r.text), 0);
    } else if (block.type === "table") {
      counts.tables += 1;
      for (const row of block.rows) {
        for (const cell of row) {
          counts.chars += cell.runs.reduce(
            (s, r) => s + visibleLength(r.text),
            0,
          );
        }
      }
    } else if (block.type === "image") {
      counts.images += 1;
    } else {
      for (const column of block.columns) countBlocks(column, counts);
    }
  }
}

// ------------------------------------------------------------
// Sections
// ------------------------------------------------------------

function layoutSection(flow: PageFlow): ISectionOptions {
  const { width, height, blocks } = flow;
  let ml = 36;
  let mt = 36;
  let mb = 36;

  if (blocks.length > 0) {
    const minX = Math.min(...blocks.map((b) => b.x));
    const maxX = Math.max(...blocks.map((b) => b.xEnd));
    const minTop = Math.min(...blocks.map((b) => b.top));
    const maxBottom = Math.max(...blocks.map((b) => b.bottom));
    ml = clamp(Math.min(minX, width - maxX), 0, width * 0.35);
    mt = clamp(minTop, 0, height * 0.45);
    mb = clamp(Math.min(height - maxBottom, 54), 0, height * 0.3);
  }

  const children = blocksToChildren(blocks, {
    mode: "layout",
    refX: ml,
    contentWidth: width - 2 * ml,
    startTop: mt,
  });

  return {
    properties: {
      type: SectionType.NEXT_PAGE,
      page: {
        size: { width: tw(width), height: tw(height) },
        margin: {
          top: tw(mt),
          bottom: tw(mb),
          left: tw(ml),
          right: tw(ml),
          header: 0,
          footer: 0,
        },
      },
    },
    children,
  };
}

function editableSection(
  flows: PageFlow[],
  running: RunningContent,
): ISectionOptions {
  const first = flows[0];
  const lefts = flows
    .filter((f) => f.blocks.length > 0)
    .map((f) => Math.min(...f.blocks.map((b) => b.x)))
    .sort((a, b) => a - b);
  const medianLeft = lefts[Math.floor(lefts.length / 2)] ?? 72;
  const side = clamp(medianLeft, 36, 108);
  const contentWidth = first.width - 2 * side;

  const children: DocxChild[] = [];
  for (const flow of flows) {
    if (flow.blocks.length === 0) continue;
    children.push(
      ...blocksToChildren(flow.blocks, {
        mode: "editable",
        refX: side,
        contentWidth,
        startTop: 0,
      }),
    );
  }
  if (children.length === 0) children.push(new Paragraph({ children: [] }));

  const headers = running.header
    ? {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: running.header, size: 18 })],
            }),
          ],
        }),
      }
    : undefined;

  let footers: ISectionOptions["footers"];
  if (running.footer || running.footerPageNumber) {
    const parts: TextRun[] = [];
    if (running.footer) parts.push(new TextRun({ text: running.footer, size: 18 }));
    if (running.footer && running.footerPageNumber) {
      parts.push(new TextRun({ text: "   ", size: 18 }));
    }
    if (running.footerPageNumber) {
      parts.push(new TextRun({ children: [PageNumber.CURRENT], size: 18 }));
    }
    footers = {
      default: new Footer({
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: parts })],
      }),
    };
  }

  return {
    headers,
    footers,
    properties: {
      page: {
        size: { width: tw(first.width), height: tw(first.height) },
        margin: {
          top: tw(72),
          bottom: tw(72),
          left: tw(side),
          right: tw(side),
        },
      },
    },
    children,
  };
}

// ------------------------------------------------------------
// Public API
// ------------------------------------------------------------

export interface BuildDocxInput {
  flows: PageFlow[];
  mode: ConversionMode;
  title: string;
  running: RunningContent;
}

export interface BuildDocxOutput {
  blob: Blob;
  expectedChars: number;
  paragraphs: number;
  tables: number;
  images: number;
}

export async function buildDocx(input: BuildDocxInput): Promise<BuildDocxOutput> {
  const { flows, mode, title, running } = input;

  const counts: Counts = { paragraphs: 0, tables: 0, images: 0, chars: 0 };
  for (const flow of flows) countBlocks(flow.blocks, counts);

  const sections =
    mode === "layout"
      ? flows.map(layoutSection)
      : [editableSection(flows, running)];

  const headingBase = {
    run: { bold: true, color: "000000", font: "Arial" },
  };

  const doc = new Document({
    creator: "PDFBerri",
    title,
    description: "Converted from PDF with PDFBerri",
    styles: {
      default: {
        document: { run: { font: "Arial", size: 22 } },
        heading1: { ...headingBase, paragraph: { spacing: { before: 240, after: 120 } } },
        heading2: { ...headingBase, paragraph: { spacing: { before: 240, after: 120 } } },
        heading3: { ...headingBase, paragraph: { spacing: { before: 200, after: 100 } } },
      },
    },
    sections,
  });

  const blob = await Packer.toBlob(doc);
  return {
    blob: new Blob([blob], { type: DOCX_MIME }),
    expectedChars: counts.chars,
    paragraphs: counts.paragraphs,
    tables: counts.tables,
    images: counts.images,
  };
}

/** Re-opens the generated package and checks structure and content. */
export async function validateDocx(
  blob: Blob,
  expectedChars: number,
): Promise<void> {
  const invalid = (reason: string) =>
    new ConversionError(
      "output-invalid",
      `The generated Word file failed validation (${reason}). Please try the other conversion mode.`,
    );

  if (blob.size === 0) throw invalid("empty file");

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(await blob.arrayBuffer());
  } catch {
    throw invalid("not a valid package");
  }

  for (const name of ["[Content_Types].xml", "_rels/.rels", "word/document.xml"]) {
    if (!zip.file(name)) throw invalid(`missing ${name}`);
  }

  const xml = await zip.file("word/document.xml")!.async("string");
  const parsed = new DOMParser().parseFromString(xml, "application/xml");
  if (parsed.getElementsByTagName("parsererror").length > 0) {
    throw invalid("malformed XML");
  }
  if (parsed.documentElement.localName !== "document") {
    throw invalid("unexpected root element");
  }
  if (parsed.getElementsByTagNameNS("*", "body").length !== 1) {
    throw invalid("missing document body");
  }

  const texts = parsed.getElementsByTagNameNS("*", "t");
  let chars = 0;
  for (let i = 0; i < texts.length; i += 1) {
    chars += visibleLength(texts[i].textContent ?? "");
  }
  if (expectedChars > 0 && chars < expectedChars * 0.95) {
    throw invalid("some text is missing");
  }
}
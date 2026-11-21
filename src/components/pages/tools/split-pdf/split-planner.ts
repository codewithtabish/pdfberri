// Pure logic. No React, no browser APIs. Safe to unit test in Node.
import { SPLIT_CONFIG } from "./split-config";
import type {
  PageRangeInput,
  SplitOutputPlan,
  SplitPlanContext,
  SplitPlanResult,
} from "./split-types";
import { pagesLabel } from "./split-utils";

const fail = (error: string): SplitPlanResult => ({ ok: false, error });

function makeOutput(id: string, filename: string, pageIndices: number[]): SplitOutputPlan {
  return { id, filename, pageIndices, pageCount: pageIndices.length, label: pagesLabel(pageIndices) };
}

function rangeIndices(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
}

/** `selectedPages` are one-based. Duplicates are removed; original order is kept. */
export function buildSelectedPagesPlan(totalPages: number, selectedPages: readonly number[]): SplitPlanResult {
  const unique = Array.from(new Set(selectedPages)).sort((a, b) => a - b);
  if (unique.length === 0) return fail("Select at least one page to extract.");
  if (unique.some((p) => !Number.isInteger(p) || p < 1 || p > totalPages)) {
    return fail(`Page numbers must be between 1 and ${totalPages}.`);
  }
  return { ok: true, outputs: [makeOutput("extracted", "Extracted-Pages.pdf", unique.map((p) => p - 1))] };
}

/**
 * Policy: ranges may NOT overlap. Gaps ARE allowed, but produce a warning
 * so the user knows some pages won't appear in any output.
 */
export function buildPageRangesPlan(totalPages: number, rows: readonly PageRangeInput[]): SplitPlanResult {
  if (rows.length === 0) return fail("Add at least one page range.");

  const parsed: Array<{ start: number; end: number; row: number }> = [];
  for (let i = 0; i < rows.length; i += 1) {
    const label = `Range ${i + 1}`;
    const startText = rows[i].start.trim();
    const endText = rows[i].end.trim();
    if (!startText || !endText) return fail(`${label} is incomplete. Enter a start and an end page.`);
    if (!/^\d+$/.test(startText) || !/^\d+$/.test(endText)) {
      return fail(`${label} must use whole numbers only.`);
    }
    const start = Number(startText);
    const end = Number(endText);
    if (start < 1) return fail(`${label} must start at page 1 or later.`);
    if (end > totalPages) return fail(`${label} ends after the last page. This PDF has ${totalPages} pages.`);
    if (start > end) return fail(`${label} starts after it ends.`);
    parsed.push({ start, end, row: i + 1 });
  }

  const sorted = [...parsed].sort((a, b) => a.start - b.start);
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].start <= sorted[i - 1].end) {
      return fail(`Range ${sorted[i - 1].row} and range ${sorted[i].row} overlap. Ranges can't share pages.`);
    }
  }

  const covered = parsed.reduce((sum, r) => sum + (r.end - r.start + 1), 0);
  const warning =
    covered < totalPages
      ? `${totalPages - covered} page${totalPages - covered === 1 ? "" : "s"} aren't in any range and won't appear in the results.`
      : undefined;

  if (parsed.length > SPLIT_CONFIG.maxOutputs) {
    return fail(`You can create up to ${SPLIT_CONFIG.maxOutputs} files at a time.`);
  }

  return {
    ok: true,
    warning,
    outputs: parsed.map((r, i) => makeOutput(`part-${i + 1}`, `Part-${i + 1}.pdf`, rangeIndices(r.start, r.end))),
  };
}

export function buildEveryPagePlan(totalPages: number): SplitPlanResult {
  if (totalPages > SPLIT_CONFIG.maxOutputs) {
    return fail(
      `Splitting every page would create ${totalPages} files. The limit is ${SPLIT_CONFIG.maxOutputs}. Try page ranges or equal parts instead.`,
    );
  }
  const width = Math.max(3, String(totalPages).length);
  return {
    ok: true,
    outputs: Array.from({ length: totalPages }, (_, i) =>
      makeOutput(`page-${i + 1}`, `Page-${String(i + 1).padStart(width, "0")}.pdf`, [i]),
    ),
  };
}

/** Earlier parts receive the remainder: 10 pages / 3 parts -> 4, 3, 3. */
export function buildEqualPartsPlan(totalPages: number, partsInput: string): SplitPlanResult {
  const text = partsInput.trim();
  if (!/^\d+$/.test(text)) return fail("Enter the number of parts as a whole number.");
  const parts = Number(text);
  if (parts < 2) return fail("Choose at least 2 parts.");
  if (parts > totalPages) return fail(`This PDF has ${totalPages} pages, so it can't be split into ${parts} parts.`);
  if (parts > SPLIT_CONFIG.maxOutputs) return fail(`You can create up to ${SPLIT_CONFIG.maxOutputs} files at a time.`);

  const base = Math.floor(totalPages / parts);
  const remainder = totalPages % parts;
  const outputs: SplitOutputPlan[] = [];
  let cursor = 0;
  for (let i = 0; i < parts; i += 1) {
    const size = base + (i < remainder ? 1 : 0);
    outputs.push(
      makeOutput(`part-${i + 1}`, `Part-${i + 1}.pdf`, Array.from({ length: size }, (_, k) => cursor + k)),
    );
    cursor += size;
  }
  return { ok: true, outputs };
}

export function buildSplitPlan(ctx: SplitPlanContext): SplitPlanResult {
  switch (ctx.method) {
    case "selected-pages":
      return buildSelectedPagesPlan(ctx.totalPages, ctx.selectedPages);
    case "page-ranges":
      return buildPageRangesPlan(ctx.totalPages, ctx.ranges);
    case "every-page":
      return buildEveryPagePlan(ctx.totalPages);
    case "equal-parts":
      return buildEqualPartsPlan(ctx.totalPages, ctx.equalParts);
  }
}

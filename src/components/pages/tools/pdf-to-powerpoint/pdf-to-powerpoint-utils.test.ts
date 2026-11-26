import { describe, expect, it } from "vitest";
import { parsePageRanges } from "./pdf-to-powerpoint-validation";
import { computeFit, pdfUserToViewport } from "./pdf-to-powerpoint-utils";

describe("parsePageRanges", () => {
  it("parses singles and ranges, removing duplicates", () => {
    expect(parsePageRanges("1,3,5-8,12,3", 20)).toEqual({ ok: true, pages: [0, 2, 4, 5, 6, 7, 11] });
  });
  it("rejects malformed, backwards and out-of-range input", () => {
    expect(parsePageRanges("1,,2", 5).ok).toBe(false);
    expect(parsePageRanges("5-2", 5).ok).toBe(false);
    expect(parsePageRanges("9", 5).ok).toBe(false);
    expect(parsePageRanges("a-b", 5).ok).toBe(false);
  });
});

describe("computeFit", () => {
  it("centers a portrait page in a widescreen slide without distortion", () => {
    const fit = computeFit(612, 792, 13.333, 7.5, "contain");
    expect(fit.height).toBeCloseTo(7.5);
    expect(fit.width / fit.height).toBeCloseTo(612 / 792);
    expect(fit.x).toBeCloseTo((13.333 - fit.width) / 2);
    expect(fit.y).toBeCloseTo(0);
  });
  it("covers the slide in cover mode", () => {
    const fit = computeFit(612, 792, 13.333, 7.5, "cover");
    expect(fit.width).toBeCloseTo(13.333);
    expect(fit.y).toBeLessThan(0);
  });
});

describe("pdfUserToViewport", () => {
  const view = [0, 0, 600, 800] as const;
  it("flips Y at rotation 0 (corners)", () => {
    expect(pdfUserToViewport(0, 800, view, 0)).toEqual({ x: 0, y: 0 });
    expect(pdfUserToViewport(600, 800, view, 0)).toEqual({ x: 600, y: 0 });
    expect(pdfUserToViewport(0, 0, view, 0)).toEqual({ x: 0, y: 800 });
    expect(pdfUserToViewport(600, 0, view, 0)).toEqual({ x: 600, y: 800 });
    expect(pdfUserToViewport(300, 400, view, 0)).toEqual({ x: 300, y: 400 });
  });
  it("handles rotation 90", () => {
    expect(pdfUserToViewport(0, 0, view, 90)).toEqual({ x: 0, y: 0 });
    expect(pdfUserToViewport(600, 0, view, 90)).toEqual({ x: 0, y: 600 });
  });
});

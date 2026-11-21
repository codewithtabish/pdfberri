import { describe, expect, it } from "vitest";
import {
  buildEqualPartsPlan,
  buildEveryPagePlan,
  buildPageRangesPlan,
  buildSelectedPagesPlan,
} from "./split-planner";

const row = (id: string, start: string, end: string) => ({ id, start, end });

describe("selected pages", () => {
  it("keeps original order and removes duplicates", () => {
    const r = buildSelectedPagesPlan(24, [12, 2, 7, 4, 9, 4]);
    expect(r.ok && r.outputs[0].pageIndices).toEqual([1, 3, 6, 8, 11]);
    expect(r.ok && r.outputs[0].filename).toBe("Extracted-Pages.pdf");
  });
  it("rejects empty and out-of-range selections", () => {
    expect(buildSelectedPagesPlan(5, []).ok).toBe(false);
    expect(buildSelectedPagesPlan(5, [6]).ok).toBe(false);
    expect(buildSelectedPagesPlan(5, [0]).ok).toBe(false);
  });
  it("handles a one-page document", () => {
    expect(buildSelectedPagesPlan(1, [1]).ok).toBe(true);
  });
});

describe("page ranges", () => {
  it("builds 4 parts for 24 pages", () => {
    const r = buildPageRangesPlan(24, [row("a", "1", "5"), row("b", "6", "10"), row("c", "11", "15"), row("d", "16", "24")]);
    expect(r.ok && r.outputs.map((o) => o.label)).toEqual(["Pages 1–5", "Pages 6–10", "Pages 11–15", "Pages 16–24"]);
    expect(r.ok && r.warning).toBeUndefined();
  });
  it("rejects overlap, malformed, reversed and out-of-bounds ranges", () => {
    expect(buildPageRangesPlan(24, [row("a", "1", "5"), row("b", "5", "9")]).ok).toBe(false);
    expect(buildPageRangesPlan(24, [row("a", "x", "5")]).ok).toBe(false);
    expect(buildPageRangesPlan(24, [row("a", "9", "5")]).ok).toBe(false);
    expect(buildPageRangesPlan(24, [row("a", "1", "25")]).ok).toBe(false);
    expect(buildPageRangesPlan(24, [row("a", "", "5")]).ok).toBe(false);
  });
  it("allows gaps with a warning", () => {
    const r = buildPageRangesPlan(10, [row("a", "1", "3"), row("b", "6", "8")]);
    expect(r.ok && r.warning).toMatch(/4 pages/);
  });
  it("supports the last page boundary", () => {
    const r = buildPageRangesPlan(10, [row("a", "10", "10")]);
    expect(r.ok && r.outputs[0].pageIndices).toEqual([9]);
  });
});

describe("every page", () => {
  it("creates one padded file per page", () => {
    const r = buildEveryPagePlan(24);
    expect(r.ok && r.outputs).toHaveLength(24);
    expect(r.ok && r.outputs[0].filename).toBe("Page-001.pdf");
  });
});

describe("equal parts", () => {
  it("divides 24 pages into 4 equal parts", () => {
    const r = buildEqualPartsPlan(24, "4");
    expect(r.ok && r.outputs.map((o) => o.label)).toEqual(["Pages 1–6", "Pages 7–12", "Pages 13–18", "Pages 19–24"]);
  });
  it("distributes the remainder to earlier parts (10 / 3)", () => {
    const r = buildEqualPartsPlan(10, "3");
    expect(r.ok && r.outputs.map((o) => o.label)).toEqual(["Pages 1–4", "Pages 5–7", "Pages 8–10"]);
  });
  it("never creates empty outputs", () => {
    expect(buildEqualPartsPlan(3, "4").ok).toBe(false);
    expect(buildEqualPartsPlan(3, "1").ok).toBe(false);
    expect(buildEqualPartsPlan(3, "abc").ok).toBe(false);
  });
});

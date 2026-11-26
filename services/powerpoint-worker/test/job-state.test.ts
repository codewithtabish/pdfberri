import { describe, expect, it } from "vitest";
import { assertTransition, canTransition, isTerminal } from "../src/job-state.js";
import { resolveSelection } from "../src/jobs.js";

describe("job state machine", () => {
  it("allows the happy path", () => {
    const path = ["queued", "validating", "inspecting", "converting", "verifying", "ready", "completed"] as const;
    for (let i = 0; i < path.length - 1; i++) expect(canTransition(path[i]!, path[i + 1]!)).toBe(true);
  });
  it("blocks skipping and going backwards", () => {
    expect(canTransition("queued", "converting")).toBe(false);
    expect(canTransition("ready", "converting")).toBe(false);
    expect(canTransition("completed", "ready")).toBe(false);
  });
  it("treats failed, cancelled and expired as terminal", () => {
    for (const s of ["failed", "cancelled", "expired"] as const) {
      expect(isTerminal(s)).toBe(true);
      expect(canTransition(s, "queued")).toBe(false);
    }
    expect(() => assertTransition("failed", "ready")).toThrow();
  });
});

describe("resolveSelection", () => {
  const base = { pageSize: "original", orientation: "auto" } as const;
  it("rejects out-of-range and empty results", () => {
    expect(() => resolveSelection(5, null, { ...base, slides: [6], includeHidden: true })).toThrow();
    expect(() => resolveSelection(2, [1, 2], { ...base, slides: null, includeHidden: false })).toThrow();
  });
  it("keeps order, dedupes, and drops hidden slides", () => {
    expect(resolveSelection(5, [2], { ...base, slides: [4, 2, 4, 1], includeHidden: false })).toEqual([3, 0]);
  });
});

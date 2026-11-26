import { describe, expect, it } from "vitest";
import { MAX_FILE_BYTES } from "./powerpoint-to-pdf-constants";
import { buildOutputFileName, sanitizeFileBaseName } from "./powerpoint-to-pdf-utils";
import { parseSlideRange, validateFileBasics, validateSettings } from "./powerpoint-to-pdf-validation";

describe("validateFileBasics", () => {
  it("accepts ppt and pptx", () => {
    expect(validateFileBasics({ name: "a.pptx", size: 10 }).ok).toBe(true);
    expect(validateFileBasics({ name: "A.PPT", size: 10 }).ok).toBe(true);
  });
  it("rejects wrong extension, empty and oversized files", () => {
    expect(validateFileBasics({ name: "a.pdf", size: 10 })).toEqual({ ok: false, code: "unsupported-type" });
    expect(validateFileBasics({ name: "a.pptx", size: 0 })).toEqual({ ok: false, code: "empty-file" });
    expect(validateFileBasics({ name: "a.pptx", size: MAX_FILE_BYTES + 1 })).toEqual({
      ok: false,
      code: "file-too-large",
    });
  });
});

describe("parseSlideRange", () => {
  it("parses singles and ranges", () => {
    expect(parseSlideRange("1,3,5-8", 10)).toEqual({ ok: true, slides: [1, 3, 5, 6, 7, 8] });
    expect(parseSlideRange(" 2 , 4 - 7 ,10", 10)).toEqual({ ok: true, slides: [2, 4, 5, 6, 7, 10] });
  });
  it("dedupes and preserves the typed order", () => {
    expect(parseSlideRange("5,1-3,2", 10)).toEqual({ ok: true, slides: [5, 1, 2, 3] });
  });
  it.each(["", "  ", "1,,3", "a", "1-", "-3", "0", "0-2", "5-2", "11", "1-11", "1.5", "1;2"])(
    "rejects %j",
    (input) => {
      expect(parseSlideRange(input, 10).ok).toBe(false);
    },
  );
});

describe("validateSettings", () => {
  it("builds a request", () => {
    const result = validateSettings(
      { selection: { mode: "custom", input: "1-2" }, pageSize: "a4", orientation: "auto", includeHidden: false },
      5,
    );
    expect(result).toEqual({
      ok: true,
      request: { slides: [1, 2], pageSize: "a4", orientation: "auto", includeHidden: false },
    });
  });
  it("uses null slides for 'all'", () => {
    const result = validateSettings(
      { selection: { mode: "all" }, pageSize: "original", orientation: "auto", includeHidden: true },
      5,
    );
    expect(result.ok && result.request.slides).toBeNull();
  });
});

describe("output file names", () => {
  it("replaces the extension", () => {
    expect(buildOutputFileName("Quarterly-Report.pptx", false)).toBe("Quarterly-Report.pdf");
  });
  it("adds a suffix for partial exports", () => {
    expect(buildOutputFileName("Quarterly-Report.pptx", true)).toBe("Quarterly-Report-selected-slides.pdf");
  });
  it("removes path parts and unsafe characters", () => {
    expect(sanitizeFileBaseName("../../etc/passwd.pptx")).toBe("passwd");
    expect(sanitizeFileBaseName('a<b>:"c|d?.pptx')).toBe("a-b-c-d");
    expect(sanitizeFileBaseName("...pptx")).toBe("presentation");
    expect(sanitizeFileBaseName("CON.pptx")).toBe("file-CON");
  });
  it("keeps Arabic and Urdu letters", () => {
    expect(sanitizeFileBaseName("پیشکش اردو.pptx")).toBe("پیشکش اردو");
  });
});

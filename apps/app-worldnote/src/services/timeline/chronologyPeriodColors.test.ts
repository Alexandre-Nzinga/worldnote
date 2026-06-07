import { describe, expect, it } from "vitest";
import {
  chronologyTimelineStyle,
  normalizeChronologyColor,
  pickDefaultChronologyColor,
} from "./chronologyPeriodColors.js";

describe("normalizeChronologyColor", () => {
  it("accepts preset hex colors", () => {
    expect(normalizeChronologyColor("#6366f1")).toBe("#6366f1");
  });

  it("rejects invalid values", () => {
    expect(normalizeChronologyColor("not-a-color")).toBeUndefined();
    expect(normalizeChronologyColor("")).toBeUndefined();
  });
});

describe("pickDefaultChronologyColor", () => {
  it("prefers unused palette colors", () => {
    expect(
      pickDefaultChronologyColor([{ color: "#6366f1" }, { color: "#38bdf8" }]),
    ).toBe("#34d399");
  });
});

describe("chronologyTimelineStyle", () => {
  it("builds a translucent bar style from a preset color", () => {
    expect(chronologyTimelineStyle("#6366f1")).toContain("#6366f1");
    expect(chronologyTimelineStyle("#6366f1")).toContain("background-color");
  });

  it("returns undefined when no color is set", () => {
    expect(chronologyTimelineStyle(undefined)).toBeUndefined();
  });
});

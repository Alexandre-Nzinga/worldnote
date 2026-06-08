import { describe, expect, it } from "vitest";
import { normalizeTimelineYear } from "./timeline-year.js";

describe("normalizeTimelineYear", () => {
  it("keeps plausible calendar years", () => {
    expect(normalizeTimelineYear(10191)).toBe(10191);
    expect(normalizeTimelineYear(-500)).toBe(-500);
  });

  it("rejects Unix millisecond timestamps mistaken for years", () => {
    expect(normalizeTimelineYear(1_890_475_600_000_000)).toBeUndefined();
  });

  it("parses year strings", () => {
    expect(normalizeTimelineYear(" 10191 ")).toBe(10191);
  });
});

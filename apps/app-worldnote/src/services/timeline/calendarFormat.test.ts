import { describe, expect, it } from "vitest";
import { coerceTimelineDate, dateToYear, formatYear, yearToDate } from "./calendarFormat.js";

describe("dateToYear", () => {
  it("reads UTC years from Date values", () => {
    expect(dateToYear(yearToDate(10191))).toBe(10191);
  });

  it("reads years from moment-like objects passed by vis-timeline", () => {
    const momentLike = {
      toDate: () => yearToDate(10191),
    };
    expect(dateToYear(momentLike)).toBe(10191);
  });

  it("treats small integers as abstract years", () => {
    expect(dateToYear(42)).toBe(42);
  });
});

describe("coerceTimelineDate", () => {
  it("round-trips moment-like values to UTC year dates", () => {
    const coerced = coerceTimelineDate({
      toDate: () => yearToDate(-500),
    });
    expect(coerced.getUTCFullYear()).toBe(-500);
  });
});

describe("formatYear", () => {
  it("appends the era suffix when provided", () => {
    expect(formatYear(10191, "AG")).toBe("10191 AG");
  });
});

const SIGNED_INTEGER_PATTERN = /-?\d+/;

/** Extract the first signed integer from a free-form date string (e.g. "Year 10191 AG"). */
export function extractYearFromString(value: string | undefined): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  const match = value.match(SIGNED_INTEGER_PATTERN);
  if (!match) {
    return undefined;
  }
  const parsed = Number.parseInt(match[0], 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Convert an abstract integer year to a Date for vis-timeline positioning. */
export function yearToDate(year: number): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, 0, 1);
  return date;
}

function hasToDate(value: object): value is { toDate: () => Date } {
  return "toDate" in value && typeof value.toDate === "function";
}

/** Normalize vis-timeline date values (Date, moment, ms timestamp, or integer year). */
export function dateToYear(value: unknown): number {
  if (value instanceof Date) {
    return value.getUTCFullYear();
  }

  if (typeof value === "object" && value !== null) {
    if (hasToDate(value)) {
      return value.toDate().getUTCFullYear();
    }
  }

  if (typeof value === "number") {
    if (Math.abs(value) <= 1_000_000) {
      return value;
    }
    const fromTimestamp = new Date(value);
    if (Number.isFinite(fromTimestamp.getTime())) {
      return fromTimestamp.getUTCFullYear();
    }
  }

  if (typeof value === "string") {
    const extracted = extractYearFromString(value);
    if (extracted !== undefined) {
      return extracted;
    }
    const parsed = new Date(value);
    if (Number.isFinite(parsed.getTime())) {
      return parsed.getUTCFullYear();
    }
  }

  throw new TypeError("Invalid timeline date value");
}

/** Convert any vis-timeline date input back to a UTC year Date. */
export function coerceTimelineDate(value: unknown): Date {
  return yearToDate(dateToYear(value));
}

/** Format a year with an optional calendar suffix, e.g. "10191 AG". */
export function formatYear(year: number, suffix = ""): string {
  const trimmedSuffix = suffix.trim();
  return trimmedSuffix ? `${year} ${trimmedSuffix}` : String(year);
}

/** Parse a year input string; returns undefined when empty or invalid. */
export function parseYearInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Format a year for numeric input fields. */
export function formatYearInput(year: number | undefined): string {
  return year === undefined ? "" : String(year);
}

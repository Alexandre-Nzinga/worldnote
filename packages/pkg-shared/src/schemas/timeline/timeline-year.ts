/** Inclusive bounds for abstract timeline year integers. */
export const MIN_TIMELINE_YEAR = -1_000_000;
export const MAX_TIMELINE_YEAR = 1_000_000;

export const TIMELINE_YEAR_GENERATION_HINT =
  "Plain calendar year integer on the world's timeline (e.g. 10191). Never a Unix timestamp or millisecond value.";

const TIMELINE_YEAR_KEYS = new Set(["start_year", "end_year"]);

export function isTimelineYearField(fieldKey: string): boolean {
  return TIMELINE_YEAR_KEYS.has(fieldKey);
}

function parseYearNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

/**
 * Coerces wizard or user year input into a safe timeline integer.
 * Rejects Unix timestamps and other out-of-range values.
 */
export function normalizeTimelineYear(value: unknown): number | undefined {
  const parsed = parseYearNumber(value);
  if (parsed === undefined) {
    return undefined;
  }

  if (Math.abs(parsed) > MAX_TIMELINE_YEAR) {
    return undefined;
  }

  return Math.min(MAX_TIMELINE_YEAR, Math.max(MIN_TIMELINE_YEAR, parsed));
}

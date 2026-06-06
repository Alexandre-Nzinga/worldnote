/** Suffix appended to year labels on the timeline axis, e.g. "AG" → "10191 AG". */
export function normalizeTimelineEraSuffix(value: string | undefined): string {
  return value?.trim() ?? "";
}

/** Omit empty suffix from persisted app settings. */
export function formatTimelineEraSuffixForStorage(
  value: string,
): string | undefined {
  const normalized = normalizeTimelineEraSuffix(value);
  return normalized.length > 0 ? normalized : undefined;
}

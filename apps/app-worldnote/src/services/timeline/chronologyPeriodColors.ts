export type ChronologyPeriodColorOption = {
  value: string;
  label: string;
};

/** Distinct bar colors that read clearly on the dark timeline surface. */
export const CHRONOLOGY_PERIOD_COLOR_OPTIONS: ChronologyPeriodColorOption[] = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#38bdf8", label: "Sky" },
  { value: "#34d399", label: "Emerald" },
  { value: "#fbbf24", label: "Amber" },
  { value: "#fb7185", label: "Rose" },
  { value: "#a78bfa", label: "Violet" },
  { value: "#2dd4bf", label: "Teal" },
  { value: "#fb923c", label: "Orange" },
  { value: "#22d3ee", label: "Cyan" },
  { value: "#a3e635", label: "Lime" },
  { value: "#e879f9", label: "Fuchsia" },
  { value: "#94a3b8", label: "Slate" },
];

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function normalizeChronologyColor(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  const lower = trimmed.toLowerCase();
  const preset = CHRONOLOGY_PERIOD_COLOR_OPTIONS.find(
    (option) => option.value.toLowerCase() === lower,
  );
  if (preset) {
    return preset.value;
  }

  if (!HEX_COLOR_PATTERN.test(trimmed)) {
    return undefined;
  }

  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return trimmed.toLowerCase();
}

export function pickDefaultChronologyColor(
  entries: ReadonlyArray<{ color?: string }>,
): string {
  const used = new Set(
    entries
      .map((entry) => normalizeChronologyColor(entry.color))
      .filter((color): color is string => Boolean(color)),
  );

  const unused = CHRONOLOGY_PERIOD_COLOR_OPTIONS.find(
    (option) => !used.has(option.value),
  );
  if (unused) {
    return unused.value;
  }

  const index = entries.length % CHRONOLOGY_PERIOD_COLOR_OPTIONS.length;
  const cyclical = CHRONOLOGY_PERIOD_COLOR_OPTIONS[index];
  if (cyclical) {
    return cyclical.value;
  }

  const first = CHRONOLOGY_PERIOD_COLOR_OPTIONS.at(0);
  return first?.value ?? "#6366f1";
}

export function chronologyTimelineStyle(color: string | undefined): string | undefined {
  const normalized = normalizeChronologyColor(color);
  if (!normalized) {
    return undefined;
  }

  return [
    `background-color: color-mix(in srgb, ${normalized} 32%, transparent)`,
    `border-color: color-mix(in srgb, ${normalized} 68%, transparent)`,
    "color: var(--color-wn-text)",
  ].join("; ");
}

export function resolveChronologyColorLabel(value: string | undefined): string {
  const normalized = normalizeChronologyColor(value);
  if (!normalized) {
    return "Default";
  }

  return (
    CHRONOLOGY_PERIOD_COLOR_OPTIONS.find((option) => option.value === normalized)
      ?.label ?? normalized
  );
}

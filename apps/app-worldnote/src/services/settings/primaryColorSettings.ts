import type { PaletteName, PaletteStep } from "@worldnote/ui";

export type PrimaryColorToken = `${PaletteName}-${PaletteStep}`;

type PrimaryColorOption = {
  value: PrimaryColorToken;
  label: string;
};

/** Curated accent swatches from the WorldNote palette (CTA / Save-style buttons). */
export const PRIMARY_COLOR_OPTIONS: readonly PrimaryColorOption[] = [
  { value: "mono-50", label: "White" },
  { value: "azure-400", label: "Azure" },
  { value: "indigo-400", label: "Indigo" },
  { value: "rose-400", label: "Rose" },
  { value: "amber-400", label: "Amber" },
  { value: "lime-400", label: "Lime" },
] as const;

export const DEFAULT_PRIMARY_COLOR: PrimaryColorToken = "mono-50";

/** Literal utilities for Tailwind to emit; also used by runtime color resolution. */
export const PRIMARY_COLOR_RUNTIME_CLASSES =
  "bg-wn-mono-50 bg-wn-mono-100 bg-wn-azure-400 bg-wn-azure-500 bg-wn-indigo-400 bg-wn-indigo-500 bg-wn-rose-400 bg-wn-rose-500 bg-wn-amber-400 bg-wn-amber-500 bg-wn-lime-400 bg-wn-lime-500 text-wn-ink text-wn-paper text-wn-mono-50 text-wn-mono-950 ring-wn-primary accent-wn-primary";

const PRIMARY_COLOR_VALUES = new Set(
  PRIMARY_COLOR_OPTIONS.map((option) => option.value),
);

const LIGHT_FOREGROUND_STEPS: ReadonlySet<PaletteStep> = new Set([
  50, 100, 200, 300, 400,
]);

function parsePrimaryColorToken(
  value: string,
): { palette: PaletteName; step: PaletteStep } | null {
  const match = /^([a-z]+)-(\d+)$/.exec(value);
  if (!match) {
    return null;
  }
  const palette = match[1];
  const step = Number(match[2]);
  const validPalettes: PaletteName[] = [
    "mono",
    "rose",
    "indigo",
    "azure",
    "lime",
    "amber",
  ];
  const validSteps: PaletteStep[] = [
    50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
  ];
  if (
    !validPalettes.includes(palette as PaletteName) ||
    !validSteps.includes(step as PaletteStep)
  ) {
    return null;
  }
  return { palette: palette as PaletteName, step: step as PaletteStep };
}

function hoverStepFor(step: PaletteStep): PaletteStep {
  if (step <= 400) {
    const bump: Record<number, PaletteStep> = {
      50: 100,
      100: 200,
      200: 300,
      300: 400,
      400: 500,
    };
    return bump[step] ?? 500;
  }
  const bump: Record<number, PaletteStep> = {
    500: 600,
    600: 700,
    700: 800,
    800: 900,
    900: 950,
    950: 950,
  };
  return bump[step] ?? 600;
}

function foregroundStepFor(step: PaletteStep): PaletteStep {
  return LIGHT_FOREGROUND_STEPS.has(step) ? 950 : 50;
}

export function normalizePrimaryColor(
  raw: string | undefined,
): PrimaryColorToken {
  if (raw && PRIMARY_COLOR_VALUES.has(raw as PrimaryColorToken)) {
    return raw as PrimaryColorToken;
  }
  return DEFAULT_PRIMARY_COLOR;
}

export function primaryColorSwatchClassName(value: PrimaryColorToken): string {
  return `bg-wn-${value}`;
}

export function primaryColorSwatchRingClassName(
  _value: PrimaryColorToken,
): string {
  return "ring-wn-border";
}

export function primaryColorOptionLabel(value: PrimaryColorToken): string {
  return (
    PRIMARY_COLOR_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

function resolveUtilityColor(
  className: string,
  property: "backgroundColor" | "color",
): string {
  const probe = document.createElement("div");
  probe.className = `pointer-events-none fixed opacity-0 ${className}`;
  document.documentElement.appendChild(probe);
  const resolved = getComputedStyle(probe)[property];
  probe.remove();
  return resolved;
}

function resolvePrimaryForegroundColor(
  palette: PaletteName,
  step: PaletteStep,
): string {
  if (palette === "mono") {
    return resolveUtilityColor(
      `text-wn-mono-${foregroundStepFor(step)}`,
      "color",
    );
  }
  return resolveUtilityColor(
    LIGHT_FOREGROUND_STEPS.has(step) ? "text-wn-ink" : "text-wn-paper",
    "color",
  );
}

/** Writes semantic primary tokens to the document root for Tailwind utilities. */
export function applyPrimaryColorToDocument(value: PrimaryColorToken): void {
  if (typeof document === "undefined") {
    return;
  }
  const parsed = parsePrimaryColorToken(value);
  if (!parsed) {
    return;
  }
  const { palette, step } = parsed;
  const hover = hoverStepFor(step);
  const root = document.documentElement;
  // Resolve to concrete colors so HeroUI/Tailwind never fail on nested var() chains.
  root.style.setProperty(
    "--wn-primary",
    resolveUtilityColor(`bg-wn-${palette}-${step}`, "backgroundColor"),
  );
  root.style.setProperty(
    "--wn-primary-hover",
    resolveUtilityColor(`bg-wn-${palette}-${hover}`, "backgroundColor"),
  );
  root.style.setProperty(
    "--wn-primary-foreground",
    resolvePrimaryForegroundColor(palette, step),
  );
}

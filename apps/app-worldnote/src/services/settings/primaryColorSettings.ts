import type { PaletteName, PaletteStep } from "@worldnote/ui";

export type PrimaryColorToken = `${PaletteName}-${PaletteStep}`;

export type ResolvedPrimaryAccent = {
  primary: string;
  hover: string;
  foreground: string;
};

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

/** Literal utilities for Tailwind to emit (runtime resolution + accent surfaces). */
export const PRIMARY_COLOR_RUNTIME_CLASSES =
  "bg-wn-primary bg-wn-primary-hover text-wn-primary-foreground bg-wn-mono-50 bg-wn-mono-100 bg-wn-azure-400 bg-wn-azure-500 bg-wn-indigo-400 bg-wn-indigo-500 bg-wn-rose-400 bg-wn-rose-500 bg-wn-amber-400 bg-wn-amber-500 bg-wn-lime-400 bg-wn-lime-500 text-wn-ink text-wn-paper text-wn-mono-50 text-wn-mono-950 ring-wn-primary accent-wn-primary";

/** Saved token for the index.html boot script. */
export const PRIMARY_COLOR_TOKEN_STORAGE_KEY = "wn-primary-color";

/** Persisted resolved values for the index.html boot script (avoids a white flash). */
export const PRIMARY_COLOR_STYLE_STORAGE_KEY = "wn-primary-color-style";

const PRIMARY_ACCENT_STYLE_ID = "wn-primary-accent";

const PRIMARY_COLOR_VALUES = new Set(
  PRIMARY_COLOR_OPTIONS.map((option) => option.value),
);

const LIGHT_FOREGROUND_STEPS: ReadonlySet<PaletteStep> = new Set([
  50, 100, 200, 300, 400,
]);

/**
 * Fixed palette steps from tailwind.css @theme.
 * With `@theme inline`, palette utilities are inlined — not readable from DOM vars.
 */
const PALETTE_STEP_COLORS: Partial<Record<PrimaryColorToken, string>> = {
  "azure-400": "oklch(70.7% 0.165 254.624)",
  "azure-500": "oklch(62.3% 0.214 259.815)",
  "indigo-400": "oklch(67.3% 0.182 276.935)",
  "indigo-500": "oklch(58.5% 0.233 277.117)",
  "rose-400": "oklch(71.2% 0.194 13.428)",
  "rose-500": "oklch(64.5% 0.246 16.439)",
  "amber-400": "oklch(82.8% 0.189 84.429)",
  "amber-500": "oklch(76.9% 0.188 70.08)",
  "lime-400": "oklch(84.1% 0.238 128.85)",
  "lime-500": "oklch(76.8% 0.233 130.85)",
};

const INK_COLOR = "oklch(14% 0 0)";
const PAPER_COLOR = "oklch(98.5% 0 0)";

/** Mono steps that flip between light/dark themes (from tailwind.css). */
const MONO_THEME_STEPS: Record<
  "light" | "dark",
  Partial<Record<PaletteStep, string>>
> = {
  dark: {
    50: "oklch(98.5% 0 0)",
    100: "oklch(96.7% 0 0)",
    950: "oklch(14% 0 0)",
  },
  light: {
    50: "oklch(14% 0 0)",
    100: "oklch(21% 0 0)",
    950: "oklch(98.5% 0 0)",
  },
};

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

export function readResolvedTheme(): "dark" {
  return "dark";
}

function resolvePaletteStepColor(
  palette: PaletteName,
  step: PaletteStep,
  theme: "light" | "dark",
): string {
  if (palette === "mono") {
    return MONO_THEME_STEPS[theme][step] ?? "";
  }
  const token = `${palette}-${step}` as PrimaryColorToken;
  return PALETTE_STEP_COLORS[token] ?? "";
}

function resolvePrimaryForegroundColor(
  palette: PaletteName,
  step: PaletteStep,
  theme: "light" | "dark",
): string {
  if (palette === "mono") {
    return MONO_THEME_STEPS[theme][foregroundStepFor(step)] ?? "";
  }
  return LIGHT_FOREGROUND_STEPS.has(step) ? INK_COLOR : PAPER_COLOR;
}

/** Resolve concrete accent colors for a token + theme (no DOM probes). */
export function resolvePrimaryAccentColors(
  value: PrimaryColorToken,
  theme: "light" | "dark" = readResolvedTheme(),
): ResolvedPrimaryAccent | null {
  const parsed = parsePrimaryColorToken(value);
  if (!parsed) {
    return null;
  }
  const { palette, step } = parsed;
  const hover = hoverStepFor(step);
  const primary = resolvePaletteStepColor(palette, step, theme);
  const primaryHover = resolvePaletteStepColor(palette, hover, theme);
  const foreground = resolvePrimaryForegroundColor(palette, step, theme);
  if (!primary || !primaryHover || !foreground) {
    return null;
  }
  return { primary, hover: primaryHover, foreground };
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

function writePrimaryAccentStyleTag(colors: ResolvedPrimaryAccent): void {
  let style = document.getElementById(PRIMARY_ACCENT_STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = PRIMARY_ACCENT_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `:root {
  --wn-primary: ${colors.primary} !important;
  --wn-primary-hover: ${colors.hover} !important;
  --wn-primary-foreground: ${colors.foreground} !important;
}`;
}

function persistPrimaryAccent(
  token: PrimaryColorToken,
  colors: ResolvedPrimaryAccent,
): void {
  try {
    window.localStorage.setItem(PRIMARY_COLOR_TOKEN_STORAGE_KEY, token);
    window.localStorage.setItem(
      PRIMARY_COLOR_STYLE_STORAGE_KEY,
      JSON.stringify(colors),
    );
  } catch {
    // Storage may be unavailable; ThemeProvider re-applies after settings load.
  }
}

/** Writes semantic primary tokens to the document root for Tailwind utilities. */
export function applyPrimaryColorToDocument(value: PrimaryColorToken): void {
  if (typeof document === "undefined") {
    return;
  }
  const colors = resolvePrimaryAccentColors(value);
  if (!colors) {
    return;
  }
  const root = document.documentElement;
  root.style.setProperty("--wn-primary", colors.primary);
  root.style.setProperty("--wn-primary-hover", colors.hover);
  root.style.setProperty("--wn-primary-foreground", colors.foreground);
  writePrimaryAccentStyleTag(colors);
  persistPrimaryAccent(value, colors);
}

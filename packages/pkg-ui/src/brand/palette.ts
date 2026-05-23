export type PaletteStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type PaletteName = "mono" | "rose" | "indigo" | "azure" | "lime" | "amber";

export type PaletteDefinition = {
  name: PaletteName;
  label: string;
  cssRoot: `--${string}`;
  baseStep: PaletteStep;
  steps: readonly PaletteStep[];
};

export const paletteSteps: readonly PaletteStep[] = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

export const worldnoteColorPalette: readonly PaletteDefinition[] = [
  {
    name: "mono",
    label: "Mono",
    cssRoot: "--color-wn-mono",
    baseStep: 900,
    steps: paletteSteps,
  },
  {
    name: "indigo",
    label: "Indigo",
    cssRoot: "--color-wn-indigo",
    baseStep: 200,
    steps: paletteSteps,
  },
  {
    name: "azure",
    label: "Azure",
    cssRoot: "--color-wn-azure",
    baseStep: 200,
    steps: paletteSteps,
  },
  {
    name: "rose",
    label: "Rose",
    cssRoot: "--color-wn-rose",
    baseStep: 200,
    steps: paletteSteps,
  },
  {
    name: "amber",
    label: "Amber",
    cssRoot: "--color-wn-amber",
    baseStep: 200,
    steps: paletteSteps,
  },
  {
    name: "lime",
    label: "Lime",
    cssRoot: "--color-wn-lime",
    baseStep: 200,
    steps: paletteSteps,
  },
] as const;



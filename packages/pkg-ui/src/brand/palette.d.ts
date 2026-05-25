export type PaletteStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type PaletteName = "mono" | "rose" | "indigo" | "azure" | "lime" | "amber";
export type PaletteDefinition = {
    name: PaletteName;
    label: string;
    cssRoot: `--${string}`;
    baseStep: PaletteStep;
    steps: readonly PaletteStep[];
};
export declare const paletteSteps: readonly PaletteStep[];
export declare const worldnoteColorPalette: readonly PaletteDefinition[];
//# sourceMappingURL=palette.d.ts.map
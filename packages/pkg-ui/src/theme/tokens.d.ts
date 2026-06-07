/** Design tokens (mirror CSS @theme where needed in TS). */
export declare const radii: {
  readonly xl: "var(--radius-xl)";
  readonly "2xl": "var(--radius-2xl)";
  readonly worldnoteCard: "var(--radius-wn-card)";
  readonly "3xl": "var(--radius-3xl)";
  readonly full: "var(--radius-full)";
};
/** Border radius scale — keep in sync with 00-Brand/BorderRadius stories. */
export declare const radiusScale: readonly [
  {
    readonly label: "rounded-xl";
    readonly token: "var(--radius-xl)";
    readonly rem: "0.75rem";
    readonly px: 12;
  },
  {
    readonly label: "rounded-2xl";
    readonly token: "var(--radius-2xl)";
    readonly rem: "1rem";
    readonly px: 16;
  },
  {
    readonly label: "rounded-wn-card";
    readonly token: "var(--radius-wn-card)";
    readonly rem: "1.25rem";
    readonly px: 20;
  },
  {
    readonly label: "rounded-3xl";
    readonly token: "var(--radius-3xl)";
    readonly rem: "1.5rem";
    readonly px: 24;
  },
  {
    readonly label: "rounded-full";
    readonly token: "var(--radius-full)";
    readonly rem: "9999px";
    readonly px: 9999;
  },
];
//# sourceMappingURL=tokens.d.ts.map

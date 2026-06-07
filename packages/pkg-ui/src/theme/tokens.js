/** Design tokens (mirror CSS @theme where needed in TS). */
export const radii = {
  xl: "var(--radius-xl)",
  "2xl": "var(--radius-2xl)",
  worldnoteCard: "var(--radius-wn-card)",
  "3xl": "var(--radius-3xl)",
  full: "var(--radius-full)",
};
/** Border radius scale — keep in sync with 00-Brand/BorderRadius stories. */
export const radiusScale = [
  { label: "rounded-xl", token: radii.xl, rem: "0.75rem", px: 12 },
  { label: "rounded-2xl", token: radii["2xl"], rem: "1rem", px: 16 },
  {
    label: "rounded-wn-card",
    token: radii.worldnoteCard,
    rem: "1.25rem",
    px: 20,
  },
  { label: "rounded-3xl", token: radii["3xl"], rem: "1.5rem", px: 24 },
  { label: "rounded-full", token: radii.full, rem: "9999px", px: 9999 },
];

/** Padding / inset width for the image-derived card border frame. */
export const CARD_CHROME_BORDER_WIDTH_PX = 5;

export const cardOuterRadiusStyle = {
  borderRadius: "var(--radius-wn-card)",
} as const;

/** Concentric inner corner when inset by {@link CARD_CHROME_BORDER_WIDTH_PX}. */
export const cardInnerRadiusStyle = {
  borderRadius: `calc(var(--radius-wn-card) - ${CARD_CHROME_BORDER_WIDTH_PX}px)`,
} as const;

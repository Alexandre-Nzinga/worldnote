export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type BodyTextLevel = "body" | "small" | "xs";

export type HeadingToken = {
  size: `--${string}`;
  spacingRem: number;
  color: `--${string}`;
  fontWeight:
    | "thin"
    | "extralight"
    | "light"
    | "regular"
    | "medium"
    | "semibold"
    | "bold"
    | "extrabold"
    | "black";
};

export type BodyTextToken = {
  label: string;
  size: `--${string}`;
  mobileSizeRem: number;
  color: `--${string}`;
  fontWeight:
    | "thin"
    | "extralight"
    | "light"
    | "regular"
    | "medium"
    | "semibold"
    | "bold"
    | "extrabold"
    | "black";
};

/**
 * Structured heading tokens.
 * - size: CSS variable token for font size
 * - spacingRem: letter-spacing in rem
 * - color: CSS variable token for text color
 */
export const headingTokens: Record<HeadingLevel, HeadingToken> = {
  h1: {
    size: "--text-wn-h1",
    spacingRem: -0.02,
    color: "--color-wn-mono-950",
    fontWeight: "semibold",
  },
  h2: {
    size: "--text-wn-h2",
    spacingRem: -0.015,
    color: "--color-wn-mono-950",
    fontWeight: "semibold",
  },
  h3: {
    size: "--text-wn-h3",
    spacingRem: -0.01,
    color: "--color-wn-mono-950",
    fontWeight: "semibold",
  },
  h4: {
    size: "--text-wn-h4",
    spacingRem: -0.006,
    color: "--color-wn-mono-950",
    fontWeight: "medium",
  },
  h5: {
    size: "--text-wn-h5",
    spacingRem: -0.003,
    color: "--color-wn-mono-950",
    fontWeight: "medium",
  },
  h6: {
    size: "--text-wn-h6",
    spacingRem: 0,
    color: "--color-wn-mono-950",
    fontWeight: "medium",
  },
};

/** Semantic heading classes (layout/font weight only). */
export const headingClass: Record<HeadingLevel, string> = {
  h1: "leading-tight",
  h2: "leading-tight",
  h3: "leading-tight",
  h4: "leading-snug",
  h5: "leading-snug",
  h6: "leading-snug",
};

/** Runtime style helper from heading tokens. */
export function getHeadingStyle(level: HeadingLevel) {
  const token = headingTokens[level];
  const fontWeightTokenMap: Record<HeadingToken["fontWeight"], `--${string}`> = {
    thin: "--font-weight-wn-thin",
    extralight: "--font-weight-wn-extralight",
    light: "--font-weight-wn-light",
    regular: "--font-weight-wn-regular",
    medium: "--font-weight-wn-medium",
    semibold: "--font-weight-wn-semibold",
    bold: "--font-weight-wn-bold",
    extrabold: "--font-weight-wn-extrabold",
    black: "--font-weight-wn-black",
  };

  return {
    fontSize: `var(${token.size})`,
    letterSpacing: `${token.spacingRem}rem`,
    color: `var(${token.color})`,
    fontWeight: `var(${fontWeightTokenMap[token.fontWeight]})`,
  };
}

export const bodyTextTokens: Record<BodyTextLevel, BodyTextToken> = {
  body: {
    label: "Body (p)",
    size: "--text-wn-body",
    mobileSizeRem: 1,
    color: "--color-wn-mono-300",
    fontWeight: "regular",
  },
  small: {
    label: "Small",
    size: "--text-wn-small",
    mobileSizeRem: 0.8,
    color: "--color-wn-mono-400",
    fontWeight: "regular",
  },
  xs: {
    label: "Extra Small",
    size: "--text-wn-xs",
    mobileSizeRem: 0.64,
    color: "--color-wn-mono-500",
    fontWeight: "regular",
  },
};

export function getBodyTextStyle(level: BodyTextLevel) {
  const token = bodyTextTokens[level];
  const fontWeightTokenMap: Record<BodyTextToken["fontWeight"], `--${string}`> = {
    thin: "--font-weight-wn-thin",
    extralight: "--font-weight-wn-extralight",
    light: "--font-weight-wn-light",
    regular: "--font-weight-wn-regular",
    medium: "--font-weight-wn-medium",
    semibold: "--font-weight-wn-semibold",
    bold: "--font-weight-wn-bold",
    extrabold: "--font-weight-wn-extrabold",
    black: "--font-weight-wn-black",
  };

  return {
    fontSize: `var(${token.size})`,
    color: `var(${token.color})`,
    fontWeight: `var(${fontWeightTokenMap[token.fontWeight]})`,
  };
}



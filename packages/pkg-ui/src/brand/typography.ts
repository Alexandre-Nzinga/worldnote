export type HeadingLevel =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6";
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
  display: {
    size: "--text-wn-display",
    spacingRem: -0.03,
    color: "--color-wn-mono-950",
    fontWeight: "bold",
  },
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
  display: "leading-none tracking-tight",
  h1: "leading-tight",
  h2: "leading-tight",
  h3: "leading-tight",
  h4: "leading-snug",
  h5: "leading-snug",
  h6: "leading-snug",
};

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

/** Text color preset for headings on dark or muted surfaces. */
export type HeadingTone = "default" | "inverse" | "subtle";

const headingToneColors: Record<Exclude<HeadingTone, "default">, string> = {
  inverse: "var(--color-wn-mono-50)",
  subtle: "var(--color-wn-mono-300)",
};

/** Runtime style helper from heading tokens. */
export function getHeadingStyle(level: HeadingLevel) {
  const token = headingTokens[level];

  return {
    fontSize: `var(${token.size})`,
    letterSpacing: `${token.spacingRem}rem`,
    color: `var(${token.color})`,
    fontWeight: `var(${fontWeightTokenMap[token.fontWeight]})`,
  };
}

export type GetHeadingPropsOptions = {
  /** Override token color — use on dark UI (`inverse`) or section labels (`subtle`). */
  tone?: HeadingTone;
  /** Override token weight. */
  weight?: HeadingToken["fontWeight"];
  /** Extra layout classes (e.g. `m-0`, `truncate`). */
  className?: string;
};

/**
 * Returns `className` + `style` for a heading from design tokens.
 * Spread onto `<h1>`–`<h6>`: `<h2 {...getHeadingProps("h6", { tone: "inverse" })}>`.
 */
export function getHeadingProps(
  level: HeadingLevel,
  options?: GetHeadingPropsOptions,
) {
  const { tone = "default", weight, className } = options ?? {};
  const style = getHeadingStyle(level);

  if (tone !== "default") {
    style.color = headingToneColors[tone];
  }
  if (weight) {
    style.fontWeight = `var(${fontWeightTokenMap[weight]})`;
  }

  return {
    className: className ? `${headingClass[level]} ${className}` : headingClass[level],
    style,
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

const bodyFontWeightTokenMap: Record<BodyTextToken["fontWeight"], `--${string}`> =
  {
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

export function getBodyTextStyle(level: BodyTextLevel) {
  const token = bodyTextTokens[level];

  return {
    fontSize: `var(${token.size})`,
    color: `var(${token.color})`,
    fontWeight: `var(${bodyFontWeightTokenMap[token.fontWeight]})`,
  };
}

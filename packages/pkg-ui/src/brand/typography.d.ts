export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type BodyTextLevel = "body" | "small" | "xs";
export type HeadingToken = {
    size: `--${string}`;
    spacingRem: number;
    color: `--${string}`;
    fontWeight: "thin" | "extralight" | "light" | "regular" | "medium" | "semibold" | "bold" | "extrabold" | "black";
};
export type BodyTextToken = {
    label: string;
    size: `--${string}`;
    mobileSizeRem: number;
    color: `--${string}`;
    fontWeight: "thin" | "extralight" | "light" | "regular" | "medium" | "semibold" | "bold" | "extrabold" | "black";
};
/**
 * Structured heading tokens.
 * - size: CSS variable token for font size
 * - spacingRem: letter-spacing in rem
 * - color: CSS variable token for text color
 */
export declare const headingTokens: Record<HeadingLevel, HeadingToken>;
/** Semantic heading classes (layout/font weight only). */
export declare const headingClass: Record<HeadingLevel, string>;
/** Runtime style helper from heading tokens. */
export declare function getHeadingStyle(level: HeadingLevel): {
    fontSize: string;
    letterSpacing: string;
    color: string;
    fontWeight: string;
};
export declare const bodyTextTokens: Record<BodyTextLevel, BodyTextToken>;
export declare function getBodyTextStyle(level: BodyTextLevel): {
    fontSize: string;
    color: string;
    fontWeight: string;
};
//# sourceMappingURL=typography.d.ts.map
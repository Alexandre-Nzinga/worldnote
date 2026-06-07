import { visualConfigFor } from "@worldnote/canvas";
import type { CardTypeBadgeOverrides } from "../settings/settings.js";
import { resolveCardBadgeOverride } from "../settings/cardTypeBadgeSettings.js";

const colorCache = new Map<string, string>();

const FALLBACK_CSS_VAR = "--color-wn-mono-400";

/** Tailwind badge class (e.g. bg-wn-amber-200) -> CSS custom property name. */
function badgeClassToCssVar(badgeClassName: string): string {
  const token = badgeClassName.replace(/^bg-/, "");
  return `--color-${token}`;
}

function resolveCssColor(cssVar: string): string {
  if (typeof document === "undefined") {
    return cssVar;
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar)
    .trim();
  return value || cssVar;
}

/** Resolves a card type discriminator to a canvas fill color from design tokens. */
export function cardTypeColor(
  cardType: string | undefined,
  overrides?: CardTypeBadgeOverrides,
): string {
  const override = cardType
    ? resolveCardBadgeOverride(cardType, overrides)
    : undefined;
  const key = `${cardType ?? "unknown"}:${override?.badgeClassName ?? ""}`;
  const cached = colorCache.get(key);
  if (cached) {
    return cached;
  }

  const config = visualConfigFor(cardType, override);
  const cssVar = badgeClassToCssVar(config.badgeClassName);
  const resolved = resolveCssColor(cssVar);
  const color = resolved || resolveCssColor(FALLBACK_CSS_VAR);
  colorCache.set(key, color);
  return color;
}

/** Label text color for graph nodes on a dark canvas background. */
export function graphLabelColor(): string {
  return resolveCachedColor("__graph-label__", "--color-wn-mono-300");
}

/** Muted tag label color beneath graph node names. */
export function graphTagLabelColor(): string {
  return resolveCachedColor("__graph-tag-label__", "--color-wn-mono-500");
}

/** Canvas image-tool attachment nodes in the graph view. */
export function graphAttachmentColor(): string {
  return resolveCachedColor("__graph-attachment__", "--color-wn-mono-400");
}

function resolveCachedColor(cacheKey: string, cssVar: string): string {
  const cached = colorCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const color = resolveCssColor(cssVar);
  colorCache.set(cacheKey, color);
  return color;
}

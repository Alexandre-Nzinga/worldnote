import {
  textClassToSwatchClass,
  type CardTypeBadgeOverride,
} from "./cardTypeBadgeSettings.js";

export type KinshipBadgeOverride = CardTypeBadgeOverride;

export const KINSHIP_BADGE_DEFAULT_BACKGROUND = "bg-wn-indigo-300";
export const KINSHIP_BADGE_DEFAULT_TEXT = "text-wn-mono-950";

export const KINSHIP_BADGE_SWATCH_DEFAULTS = {
  background: KINSHIP_BADGE_DEFAULT_BACKGROUND,
  text: KINSHIP_BADGE_DEFAULT_TEXT,
} as const;

export function normalizeKinshipBadgeOverride(
  raw: KinshipBadgeOverride | undefined,
): KinshipBadgeOverride {
  return raw ?? {};
}

export function resolveKinshipBadgeStyle(
  override: KinshipBadgeOverride | undefined,
) {
  return {
    badgeClassName:
      override?.badgeClassName ?? KINSHIP_BADGE_DEFAULT_BACKGROUND,
    badgeTextColor: override?.badgeTextColor ?? KINSHIP_BADGE_DEFAULT_TEXT,
  };
}

export function kinshipBadgeBackgroundSelectValue(
  override: KinshipBadgeOverride,
): string {
  return override.badgeClassName ?? "";
}

export function kinshipBadgeTextSelectValue(
  override: KinshipBadgeOverride,
): string {
  return override.badgeTextColor ?? "";
}

export function resolveKinshipBackgroundSwatchClass(value: string): string {
  return value || KINSHIP_BADGE_DEFAULT_BACKGROUND;
}

export function resolveKinshipTextSwatchClass(value: string): string {
  const textClass = value || KINSHIP_BADGE_DEFAULT_TEXT;
  return textClassToSwatchClass(textClass);
}

function compactKinshipBadgeOverride(
  entry: KinshipBadgeOverride | undefined,
): KinshipBadgeOverride | undefined {
  if (!entry) {
    return undefined;
  }
  const compact: KinshipBadgeOverride = {};
  if (entry.badgeClassName) {
    compact.badgeClassName = entry.badgeClassName;
  }
  if (entry.badgeTextColor) {
    compact.badgeTextColor = entry.badgeTextColor;
  }
  return compact.badgeClassName || compact.badgeTextColor ? compact : undefined;
}

export function hasKinshipBadgeOverride(
  override: KinshipBadgeOverride,
): boolean {
  return !!(override.badgeClassName || override.badgeTextColor);
}

export function setKinshipBadgeBackground(
  override: KinshipBadgeOverride,
  badgeClassName: string,
): KinshipBadgeOverride {
  const entry = { ...override };
  if (!badgeClassName || badgeClassName === KINSHIP_BADGE_DEFAULT_BACKGROUND) {
    entry.badgeClassName = undefined;
  } else {
    entry.badgeClassName = badgeClassName;
  }
  return compactKinshipBadgeOverride(entry) ?? {};
}

export function setKinshipBadgeTextColor(
  override: KinshipBadgeOverride,
  badgeTextColor: string,
): KinshipBadgeOverride {
  const entry = { ...override };
  if (!badgeTextColor || badgeTextColor === KINSHIP_BADGE_DEFAULT_TEXT) {
    entry.badgeTextColor = undefined;
  } else {
    entry.badgeTextColor = badgeTextColor;
  }
  return compactKinshipBadgeOverride(entry) ?? {};
}

export function resetKinshipBadgeOverride(): KinshipBadgeOverride {
  return {};
}

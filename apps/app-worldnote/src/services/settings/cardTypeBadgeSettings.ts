import {
  CONFIGURED_CARD_TYPES,
  visualConfigFor,
  type CardVisualOverride,
} from "@worldnote/canvas";

export type CardTypeBadgeOverride = CardVisualOverride;

export type CardTypeBadgeOverrides = Record<string, CardTypeBadgeOverride>;

const BADGE_TEXT_DEFAULT_VALUE = "";

export const BADGE_TEXT_COLOR_OPTIONS = [
  { value: BADGE_TEXT_DEFAULT_VALUE, label: "Default" },
  { value: "text-wn-mono-50", label: "Light" },
  { value: "text-wn-mono-950", label: "Dark" },
] as const;

/** Curated badge background tokens from the design system. */
export const BADGE_BACKGROUND_OPTIONS = [
  "bg-wn-mono-300",
  "bg-wn-mono-400",
  "bg-wn-mono-500",
  "bg-wn-mono-600",
  "bg-wn-mono-800",
  "bg-wn-amber-200",
  "bg-wn-amber-300",
  "bg-wn-amber-400",
  "bg-wn-amber-500",
  "bg-wn-indigo-200",
  "bg-wn-indigo-300",
  "bg-wn-indigo-400",
  "bg-wn-azure-200",
  "bg-wn-azure-300",
  "bg-wn-azure-400",
  "bg-wn-lime-300",
  "bg-wn-lime-400",
  "bg-wn-rose-300",
  "bg-wn-rose-400",
  "bg-wn-red-300",
  "bg-wn-red-400",
] as const;

function badgeBackgroundLabel(className: string): string {
  const token = className.replace(/^bg-/, "").replace(/^wn-/, "");
  const parts = token.split("-");
  const shade = parts.pop();
  const family = parts.join(" ");
  return `${family} ${shade}`.replace(/\b\w/g, (char) => char.toUpperCase());
}

export const BADGE_BACKGROUND_SELECT_OPTIONS = [
  { value: "", label: "Default" },
  ...BADGE_BACKGROUND_OPTIONS.map((value) => ({
    value,
    label: badgeBackgroundLabel(value),
  })),
];

export function normalizeCardTypeBadgeOverrides(
  raw: CardTypeBadgeOverrides | undefined,
): CardTypeBadgeOverrides {
  return raw ?? {};
}

export function resolveCardBadgeOverride(
  cardType: string,
  overrides: CardTypeBadgeOverrides | undefined,
): CardVisualOverride | undefined {
  return overrides?.[cardType];
}

export function resolveCardBadgeStyle(
  cardType: string | undefined,
  overrides: CardTypeBadgeOverrides | undefined,
) {
  const override = cardType ? overrides?.[cardType] : undefined;
  const visual = visualConfigFor(cardType, override);
  return {
    label: visual.label,
    badgeClassName: visual.badgeClassName,
    badgeTextColor: visual.badgeTextColor,
  };
}

export function defaultBadgeBackgroundFor(cardType: string): string {
  return visualConfigFor(cardType).badgeClassName;
}

export function defaultBadgeTextFor(cardType: string): string {
  return visualConfigFor(cardType).badgeTextColor ?? BADGE_TEXT_DEFAULT_VALUE;
}

export { CONFIGURED_CARD_TYPES };

export function textClassToSwatchClass(textClass: string): string {
  if (textClass.startsWith("text-")) {
    return textClass.replace("text-", "bg-");
  }
  return "bg-wn-mono-950";
}

export function resolveBadgeBackgroundSwatchClass(
  cardType: string,
  value: string,
): string {
  return value || defaultBadgeBackgroundFor(cardType);
}

export function resolveBadgeTextSwatchClass(
  cardType: string,
  value: string,
): string {
  const textClass = value || defaultBadgeTextFor(cardType) || "text-wn-mono-950";
  return textClassToSwatchClass(textClass);
}

export function badgeBackgroundSelectValue(
  cardType: string,
  overrides: CardTypeBadgeOverrides,
): string {
  return overrides[cardType]?.badgeClassName ?? "";
}

export function badgeTextSelectValue(
  cardType: string,
  overrides: CardTypeBadgeOverrides,
): string {
  return overrides[cardType]?.badgeTextColor ?? "";
}

function compactBadgeOverride(
  entry: CardTypeBadgeOverride | undefined,
): CardTypeBadgeOverride | undefined {
  if (!entry) {
    return undefined;
  }
  const compact: CardTypeBadgeOverride = {};
  if (entry.badgeClassName) {
    compact.badgeClassName = entry.badgeClassName;
  }
  if (entry.badgeTextColor) {
    compact.badgeTextColor = entry.badgeTextColor;
  }
  return compact.badgeClassName || compact.badgeTextColor ? compact : undefined;
}

function withCardBadgeOverride(
  overrides: CardTypeBadgeOverrides,
  cardType: string,
  entry: CardTypeBadgeOverride | undefined,
): CardTypeBadgeOverrides {
  const next = { ...overrides };
  const compact = compactBadgeOverride(entry);
  if (!compact) {
    const { [cardType]: _removed, ...rest } = next;
    return rest;
  }
  next[cardType] = compact;
  return next;
}

export function setCardBadgeBackground(
  overrides: CardTypeBadgeOverrides,
  cardType: string,
  badgeClassName: string,
): CardTypeBadgeOverrides {
  const entry = { ...overrides[cardType] };
  if (!badgeClassName || badgeClassName === defaultBadgeBackgroundFor(cardType)) {
    entry.badgeClassName = undefined;
  } else {
    entry.badgeClassName = badgeClassName;
  }
  return withCardBadgeOverride(overrides, cardType, entry);
}

export function setCardBadgeTextColor(
  overrides: CardTypeBadgeOverrides,
  cardType: string,
  badgeTextColor: string,
): CardTypeBadgeOverrides {
  const entry = { ...overrides[cardType] };
  if (!badgeTextColor || badgeTextColor === defaultBadgeTextFor(cardType)) {
    entry.badgeTextColor = undefined;
  } else {
    entry.badgeTextColor = badgeTextColor;
  }
  return withCardBadgeOverride(overrides, cardType, entry);
}

export function resetCardBadgeOverride(
  overrides: CardTypeBadgeOverrides,
  cardType: string,
): CardTypeBadgeOverrides {
  const { [cardType]: _removed, ...rest } = overrides;
  return rest;
}

export type WorldNoteCardType =
  | "character"
  | "location"
  | "item"
  | "vehicle"
  | "flora"
  | "fauna"
  | "building"
  | "structure"
  | "species"
  | "planet"
  | "organization"
  | "polity"
  | "event"
  | "family"
  | "group"
  | "star"
  | "moon"
  | "asteroid"
  | "satellite"
  | "law"
  | "religion"
  | "language"
  | "culture"
  | "spell"
  | "disease"
  | "disaster"
  | "combat_style";

export type CardVisualConfig = {
  label: string;
  badgeClassName: string;
  widthClass: string;
  aspectClass: string;
  titleClassName?: string;
  badgeTextColor?: string;
};

/** User overrides for badge colors (from app settings). */
export type CardVisualOverride = {
  badgeClassName?: string;
  badgeTextColor?: string;
};

export const CARD_VISUAL_CONFIG: Record<WorldNoteCardType, CardVisualConfig> = {
  character: {
    label: "Character",
    badgeClassName: "bg-wn-mono-300",
    widthClass: "w-[250px]",
    aspectClass: "aspect-3/4",
    titleClassName: "text-xl font-semibold leading-tight",
  },
  location: {
    label: "Location",
    badgeClassName: "bg-wn-mono-800",
    badgeTextColor: "text-wn-mono-50",
    widthClass: "w-[280px]",
    aspectClass: "aspect-5/3",
  },
  item: {
    label: "Item",
    badgeClassName: "bg-wn-amber-200",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  vehicle: {
    label: "Vehicle",
    badgeClassName: "bg-wn-indigo-200",
    widthClass: "w-[280px]",
    aspectClass: "aspect-5/3",
  },
  flora: {
    label: "Flora",
    badgeClassName: "bg-wn-lime-300",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  fauna: {
    label: "Fauna",
    badgeClassName: "bg-wn-rose-300",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  building: {
    label: "Building",
    badgeClassName: "bg-wn-mono-300",
    widthClass: "w-[280px]",
    aspectClass: "aspect-5/3",
  },
  structure: {
    label: "Structure",
    badgeClassName: "bg-wn-mono-400",
    widthClass: "w-[280px]",
    aspectClass: "aspect-5/3",
  },
  species: {
    label: "Species",
    badgeClassName: "bg-wn-azure-200",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  planet: {
    label: "Planet",
    badgeClassName: "bg-wn-amber-400",
    widthClass: "w-[260px]",
    aspectClass: "aspect-square",
  },
  organization: {
    label: "Organization",
    badgeClassName: "bg-wn-azure-400",
    badgeTextColor: "text-wn-mono-50",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  polity: {
    label: "Polity",
    badgeClassName: "bg-wn-lime-400",
    badgeTextColor: "text-wn-mono-50",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  event: {
    label: "Event",
    badgeClassName: "bg-wn-mono-500",
    badgeTextColor: "text-wn-mono-50",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  family: {
    label: "Family",
    badgeClassName: "bg-wn-lime-300",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  group: {
    label: "Group",
    badgeClassName: "bg-wn-azure-300",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  star: {
    label: "Star",
    badgeClassName: "bg-wn-amber-300",
    widthClass: "w-[260px]",
    aspectClass: "aspect-square",
  },
  moon: {
    label: "Moon",
    badgeClassName: "bg-wn-indigo-300",
    widthClass: "w-[260px]",
    aspectClass: "aspect-square",
  },
  asteroid: {
    label: "Asteroid",
    badgeClassName: "bg-wn-amber-200",
    widthClass: "w-[260px]",
    aspectClass: "aspect-square",
  },
  satellite: {
    label: "Satellite",
    badgeClassName: "bg-wn-indigo-400",
    badgeTextColor: "text-wn-mono-50",
    widthClass: "w-[260px]",
    aspectClass: "aspect-square",
  },
  law: {
    label: "Law",
    badgeClassName: "bg-wn-mono-600",
    badgeTextColor: "text-wn-mono-50",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  religion: {
    label: "Religion",
    badgeClassName: "bg-wn-indigo-300",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  language: {
    label: "Language",
    badgeClassName: "bg-wn-azure-300",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  culture: {
    label: "Culture",
    badgeClassName: "bg-wn-amber-300",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  spell: {
    label: "Spell",
    badgeClassName: "bg-wn-indigo-400",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  disease: {
    label: "Disease",
    badgeClassName: "bg-wn-red-300",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  disaster: {
    label: "Disaster",
    badgeClassName: "bg-wn-red-400",
    badgeTextColor: "text-wn-mono-50",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  combat_style: {
    label: "Combat Style",
    badgeClassName: "bg-wn-rose-400",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
};

const DEFAULT_VISUAL_CONFIG = CARD_VISUAL_CONFIG.location;

const visualConfigByCardType: Record<string, CardVisualConfig> =
  CARD_VISUAL_CONFIG;

export function visualConfigFor(
  cardType: WorldNoteCardType | string | undefined,
  override?: CardVisualOverride,
): CardVisualConfig {
  const base =
    cardType && cardType in visualConfigByCardType
      ? (visualConfigByCardType[cardType] ?? DEFAULT_VISUAL_CONFIG)
      : DEFAULT_VISUAL_CONFIG;

  if (!override) {
    return base;
  }

  return {
    ...base,
    ...(override.badgeClassName
      ? { badgeClassName: override.badgeClassName }
      : {}),
    ...(override.badgeTextColor
      ? { badgeTextColor: override.badgeTextColor }
      : {}),
  };
}

/** All configured card types for settings UIs. */
export const CONFIGURED_CARD_TYPES: WorldNoteCardType[] = Object.keys(
  CARD_VISUAL_CONFIG,
) as WorldNoteCardType[];

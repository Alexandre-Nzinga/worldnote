export type WorldNoteCardType =
  | "character"
  | "location"
  | "item"
  | "vehicle"
  | "flora"
  | "fauna"
  | "building"
  | "structure"
  | "species";

export type CardVisualConfig = {
  label: string;
  badgeClassName: string;
  widthClass: string;
  aspectClass: string;
  titleClassName?: string;
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
};

const DEFAULT_VISUAL_CONFIG = CARD_VISUAL_CONFIG.location;

export function visualConfigFor(
  cardType: WorldNoteCardType | string | undefined,
): CardVisualConfig {
  if (cardType && cardType in CARD_VISUAL_CONFIG) {
    return CARD_VISUAL_CONFIG[cardType as WorldNoteCardType];
  }
  return DEFAULT_VISUAL_CONFIG;
}

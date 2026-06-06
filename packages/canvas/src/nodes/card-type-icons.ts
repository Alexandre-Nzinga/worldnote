import type { WorldNoteCardType } from "./card-visual-config.js";

/** Material Symbol names for each card type (link picker, vault filters, etc.). */
export const CARD_TYPE_ICONS: Record<WorldNoteCardType, string> = {
  character: "person",
  location: "location_on",
  item: "inventory_2",
  vehicle: "directions_car",
  flora: "eco",
  fauna: "pets",
  building: "apartment",
  structure: "account_tree",
  species: "biotech",
  planet: "public",
  organization: "corporate_fare",
  polity: "flag",
  event: "event",
  family: "family_restroom",
  group: "groups",
  star: "star",
  moon: "brightness_3",
  asteroid: "blur_circular",
  satellite: "satellite_alt",
  law: "gavel",
  religion: "church",
  language: "translate",
  culture: "theater_comedy",
  spell: "auto_fix_high",
  disease: "coronavirus",
  disaster: "warning",
  combat_style: "sports_martial_arts",
};

const DEFAULT_ICON = "category";

export function cardTypeIconFor(cardType: string | undefined): string {
  if (cardType && cardType in CARD_TYPE_ICONS) {
    return CARD_TYPE_ICONS[cardType as WorldNoteCardType];
  }
  return DEFAULT_ICON;
}

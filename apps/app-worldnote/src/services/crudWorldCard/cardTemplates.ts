import {
  NEW_CARD_DEFAULT_NAMES,
  type FloraCard,
  type StructureCard,
  type VehicleCard,
  type WorldCard,
} from "@worldnote/shared";

/** Card types users can create from the canvas toolbar. */
export type NewCardType = Exclude<WorldCard["card_type"], never>;

type Position = {
  x: number;
  y: number;
};

const baseFields = (cardType: NewCardType, position: Position, name?: string) => ({
  id: crypto.randomUUID(),
  name: name?.trim() || NEW_CARD_DEFAULT_NAMES[cardType],
  card_type: cardType,
  parent_id: null,
  position,
  tags: [] satisfies string[],
  custom_properties: {} satisfies Record<string, unknown>,
});

export function createCardTemplate(
  cardType: NewCardType,
  position: Position,
  name?: string,
): WorldCard {
  const base = baseFields(cardType, position, name);

  switch (cardType) {
    case "character":
      return { ...base, card_type: "character" };
    case "location":
      return { ...base, card_type: "location" };
    case "item":
      return { ...base, card_type: "item" };
    case "vehicle":
      return {
        ...base,
        card_type: "vehicle",
        sub_type: "other",
      } satisfies VehicleCard;
    case "flora":
      return {
        ...base,
        card_type: "flora",
        toxicity_level: "harmless",
      } satisfies FloraCard;
    case "fauna":
      return { ...base, card_type: "fauna" };
    case "building":
      return { ...base, card_type: "building" };
    case "structure":
      return {
        ...base,
        card_type: "structure",
        condition: "intact",
      } satisfies StructureCard;
    case "species":
      return { ...base, card_type: "species" };
    case "planet":
      return { ...base, card_type: "planet" };
    case "organization":
      return { ...base, card_type: "organization" };
    case "polity":
      return { ...base, card_type: "polity" };
    case "event":
      return { ...base, card_type: "event" };
    case "family":
      return { ...base, card_type: "family" };
    case "group":
      return { ...base, card_type: "group" };
    case "star":
      return { ...base, card_type: "star" };
    case "moon":
      return { ...base, card_type: "moon" };
    case "asteroid":
      return { ...base, card_type: "asteroid" };
    case "satellite":
      return { ...base, card_type: "satellite" };
    case "law":
      return { ...base, card_type: "law" };
    case "religion":
      return { ...base, card_type: "religion" };
    case "language":
      return { ...base, card_type: "language" };
    case "culture":
      return { ...base, card_type: "culture" };
    case "spell":
      return { ...base, card_type: "spell" };
    case "disease":
      return { ...base, card_type: "disease" };
    case "disaster":
      return { ...base, card_type: "disaster" };
    case "combat_style":
      return { ...base, card_type: "combat_style" };
    default: {
      const _exhaustive: never = cardType;
      return _exhaustive;
    }
  }
}

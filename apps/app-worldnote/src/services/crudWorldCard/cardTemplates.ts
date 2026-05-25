import type { WorldCard } from "@worldnote/shared";

export type NewCardType = "character" | "location";

type Position = {
  x: number;
  y: number;
};

export function createCardTemplate(
  cardType: NewCardType,
  position: Position,
  name?: string,
): WorldCard {
  const defaultName =
    cardType === "character" ? "New Character" : "New Location";
  return {
    id: crypto.randomUUID(),
    name: name?.trim() || defaultName,
    card_type: cardType,
    parent_id: null,
    position,
    tags: [],
    custom_properties: {},
  };
}

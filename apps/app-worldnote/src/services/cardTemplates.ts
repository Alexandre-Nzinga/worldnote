import type { WorldCard } from "@worldnote/shared";

export type NewCardType = "character" | "location";

type Position = {
  x: number;
  y: number;
};

export function createCardTemplate(
  cardType: NewCardType,
  position: Position,
): WorldCard {
  return {
    id: crypto.randomUUID(),
    name: cardType === "character" ? "New Character" : "New Location",
    card_type: cardType,
    parent_id: null,
    position,
    tags: [],
    custom_properties: {},
  };
}

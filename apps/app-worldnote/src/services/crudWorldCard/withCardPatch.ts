import type { WorldCard } from "@worldnote/shared";

/** Merges partial updates into a card. Spread loses the discriminated union tag. */
export function withCardPatch(
  card: WorldCard,
  patch: Partial<WorldCard>,
): WorldCard {
  return { ...card, ...patch } as WorldCard;
}

import type { WorldCard } from "@worldnote/shared";

/** Cards whose `parent_id` points at this group card. */
export function cardsInGroup(
  groupId: string,
  cardsById: Record<string, WorldCard>,
): WorldCard[] {
  return Object.values(cardsById)
    .filter((card) => card.parent_id === groupId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

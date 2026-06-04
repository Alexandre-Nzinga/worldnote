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

/** Group members stored in lore only (not placed on the canvas manifest). */
export function isGroupMemberHiddenOnCanvas(
  card: WorldCard,
  cardsById: Record<string, WorldCard>,
  manifestCardIds: ReadonlySet<string>,
): boolean {
  if (!card.parent_id || manifestCardIds.has(card.id)) {
    return false;
  }
  return cardsById[card.parent_id]?.card_type === "group";
}

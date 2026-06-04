import type { WorldCard } from "@worldnote/shared";
import { cardsInGroup } from "../canvas/groupMemberCards.js";
import { duplicateWorldCard } from "./duplicateWorldCard.js";
import { updateWorldCard } from "./updateWorldCard.js";

export type DuplicateWorldCardsResult = {
  cards: WorldCard[];
  /** Cards that should appear as separate nodes on the canvas. */
  canvasCardIds: string[];
};

/** When duplicating/copying a group card, include cards that belong to it. */
export function expandCardIdsIncludingGroupMembers(
  cardIds: string[],
  cardsById: Record<string, WorldCard>,
): string[] {
  const expanded = new Set(cardIds);
  for (const id of cardIds) {
    const card = cardsById[id];
    if (card?.card_type === "group") {
      for (const member of cardsInGroup(id, cardsById)) {
        expanded.add(member.id);
      }
    }
  }
  return [...expanded];
}

/** Duplicate groups before members so `parent_id` can be remapped. */
export function sortCardIdsForGroupDuplicate(
  cardIds: string[],
  cardsById: Record<string, WorldCard>,
): string[] {
  const set = new Set(cardIds);
  const groups: string[] = [];
  const members: string[] = [];
  const rest: string[] = [];

  for (const id of cardIds) {
    const card = cardsById[id];
    if (!card) {
      continue;
    }
    if (card.card_type === "group") {
      groups.push(id);
    } else if (card.parent_id && set.has(card.parent_id)) {
      members.push(id);
    } else {
      rest.push(id);
    }
  }

  return [...groups, ...members, ...rest];
}

function isDuplicatedGroupMember(
  source: WorldCard,
  cardsById: Record<string, WorldCard>,
  duplicatedGroupSourceIds: Set<string>,
): boolean {
  if (!source.parent_id || !duplicatedGroupSourceIds.has(source.parent_id)) {
    return false;
  }
  return cardsById[source.parent_id]?.card_type === "group";
}

export async function duplicateWorldCardsWithGroup(
  vault: string,
  cardIds: string[],
  cardsById: Record<string, WorldCard>,
  offset: { x: number; y: number } = { x: 48, y: 48 },
): Promise<DuplicateWorldCardsResult> {
  const expanded = expandCardIdsIncludingGroupMembers(cardIds, cardsById);
  const ordered = sortCardIdsForGroupDuplicate(expanded, cardsById);
  const duplicatedGroupSourceIds = new Set(
    ordered.filter((id) => cardsById[id]?.card_type === "group"),
  );
  const idMap = new Map<string, string>();
  const cards: WorldCard[] = [];
  const canvasCardIds: string[] = [];

  for (const id of ordered) {
    const source = cardsById[id];
    if (!source) {
      continue;
    }

    const memberOnly =
      source.card_type !== "group" &&
      isDuplicatedGroupMember(source, cardsById, duplicatedGroupSourceIds);

    let duplicated = await duplicateWorldCard(vault, id, offset, {
      registerOnCanvas: !memberOnly,
    });
    idMap.set(id, duplicated.id);

    const newParentId =
      source.parent_id != null ? idMap.get(source.parent_id) : undefined;
    if (newParentId && duplicated.parent_id !== newParentId) {
      const parentCard = cards.find((entry) => entry.id === newParentId);
      duplicated = await updateWorldCard(vault, {
        ...duplicated,
        parent_id: newParentId,
        position: memberOnly && parentCard ? parentCard.position : duplicated.position,
      });
    }

    cards.push(duplicated);
    if (!memberOnly) {
      canvasCardIds.push(duplicated.id);
    }
  }

  return { cards, canvasCardIds };
}

export function duplicatedCardsOnCanvas(
  result: DuplicateWorldCardsResult,
): WorldCard[] {
  const onCanvas = new Set(result.canvasCardIds);
  return result.cards.filter((card) => onCanvas.has(card.id));
}

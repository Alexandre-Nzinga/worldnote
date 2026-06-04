import type { Link, SocketDescriptor, WorldCard } from "@worldnote/shared";
import { CARD_TYPE_LABELS } from "@worldnote/shared";

export type CardReferenceListItem = {
  id: string;
  name: string;
  typeLabel: string;
};

export type SocketLinkEntry = {
  linkId: string;
  targetCardId: string;
  targetName: string;
};

export function eligibleCardsForSocket(
  descriptor: SocketDescriptor,
  cardsById: Record<string, WorldCard>,
  options: { excludeCardIds: Set<string> },
): CardReferenceListItem[] {
  const result: CardReferenceListItem[] = [];
  for (const card of Object.values(cardsById)) {
    if (options.excludeCardIds.has(card.id)) {
      continue;
    }
    if (!descriptor.accepts.includes(card.card_type)) {
      continue;
    }
    result.push({
      id: card.id,
      name: card.name,
      typeLabel: CARD_TYPE_LABELS[card.card_type],
    });
  }
  return result.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export function currentSocketLinks(
  cardId: string,
  socketId: string,
  links: Link[],
  cardsById: Record<string, WorldCard>,
): SocketLinkEntry[] {
  return links
    .filter(
      (link) => link.source_card === cardId && link.source_socket === socketId,
    )
    .map((link) => ({
      linkId: link.id,
      targetCardId: link.target_card,
      targetName: cardsById[link.target_card]?.name ?? "Unknown",
    }));
}

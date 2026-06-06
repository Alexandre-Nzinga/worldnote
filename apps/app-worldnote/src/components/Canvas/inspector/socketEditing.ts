import { cardTypeIconFor } from "@worldnote/canvas";
import type { Link, SocketDescriptor, WorldCard } from "@worldnote/shared";
import { CARD_TYPE_LABELS } from "@worldnote/shared";
import type { CardTypeBadgeOverrides } from "../../../services/settings/settings.js";
import { resolveCardBadgeStyle } from "../../../services/settings/cardTypeBadgeSettings.js";
import type { CardReferenceOption } from "@worldnote/ui";

export type CardReferenceListItem = {
  id: string;
  name: string;
  cardType: WorldCard["card_type"];
  typeLabel: string;
  typeIcon: string;
  badgeClassName: string;
  badgeTextColor?: string;
};

export type SocketLinkEntry = {
  linkId: string;
  targetCardId: string;
  targetName: string;
  targetCardType?: WorldCard["card_type"];
};

export function cardToReferenceOption(
  card: WorldCard,
  badgeOverrides?: CardTypeBadgeOverrides,
): CardReferenceListItem {
  const badge = resolveCardBadgeStyle(card.card_type, badgeOverrides);
  return {
    id: card.id,
    name: card.name,
    cardType: card.card_type,
    typeLabel: CARD_TYPE_LABELS[card.card_type],
    typeIcon: cardTypeIconFor(card.card_type),
    badgeClassName: badge.badgeClassName,
    badgeTextColor: badge.badgeTextColor,
  };
}

export function toCardReferenceOption(
  item: CardReferenceListItem,
): CardReferenceOption {
  return {
    id: item.id,
    name: item.name,
    typeLabel: item.typeLabel,
    typeIcon: item.typeIcon,
    badgeClassName: item.badgeClassName,
    badgeTextColor: item.badgeTextColor,
  };
}

export function eligibleCardsForSocket(
  descriptor: SocketDescriptor,
  cardsById: Record<string, WorldCard>,
  options: {
    excludeCardIds: Set<string>;
    badgeOverrides?: CardTypeBadgeOverrides;
  },
): CardReferenceListItem[] {
  const result: CardReferenceListItem[] = [];
  for (const card of Object.values(cardsById)) {
    if (options.excludeCardIds.has(card.id)) {
      continue;
    }
    if (!descriptor.accepts.includes(card.card_type)) {
      continue;
    }
    result.push(cardToReferenceOption(card, options.badgeOverrides));
  }
  return result.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export function recentEligibleForSocket(
  recentCardIds: string[],
  eligible: CardReferenceListItem[],
): CardReferenceListItem[] {
  const eligibleById = new Map(eligible.map((item) => [item.id, item]));
  const seen = new Set<string>();
  const result: CardReferenceListItem[] = [];
  for (const cardId of recentCardIds) {
    if (seen.has(cardId)) {
      continue;
    }
    const item = eligibleById.get(cardId);
    if (!item) {
      continue;
    }
    seen.add(cardId);
    result.push(item);
  }
  return result;
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
      targetCardType: cardsById[link.target_card]?.card_type,
    }));
}

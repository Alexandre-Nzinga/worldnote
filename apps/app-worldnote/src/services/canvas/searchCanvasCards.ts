import type { WorldCard } from "@worldnote/shared";

export type CardSearchMatchKind = "name" | "tag" | "lore";

export type CardSearchResult = {
  cardId: string;
  matchKind: CardSearchMatchKind;
  matchDetail?: string;
};

/** Strips wikilink-style `[[` / `]]` wrappers for mention-style queries. */
export function normalizeCardSearchQuery(query: string): string {
  let normalized = query.trim().toLowerCase();
  if (normalized.startsWith("[[")) {
    normalized = normalized.slice(2);
  }
  if (normalized.endsWith("]]")) {
    normalized = normalized.slice(0, -2);
  }
  return normalized.trim();
}

function matchScore(kind: CardSearchMatchKind, name: string, query: string): number {
  const lowerName = name.toLowerCase();
  if (kind === "name") {
    if (lowerName === query) {
      return 0;
    }
    if (lowerName.startsWith(query)) {
      return 1;
    }
    return 2;
  }
  if (kind === "tag") {
    return 3;
  }
  return 4;
}

export function searchCanvasCards(
  cards: WorldCard[],
  query: string,
  limit = 20,
): CardSearchResult[] {
  const normalized = normalizeCardSearchQuery(query);
  const cardsById = new Map(cards.map((card) => [card.id, card]));

  if (!normalized) {
    return cards
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, limit)
      .map((card) => ({ cardId: card.id, matchKind: "name" as const }));
  }

  const results: CardSearchResult[] = [];
  const seen = new Set<string>();

  for (const card of cards) {
    if (card.name.toLowerCase().includes(normalized)) {
      results.push({ cardId: card.id, matchKind: "name" });
      seen.add(card.id);
      continue;
    }
    const tag = card.tags.find((entry) =>
      entry.toLowerCase().includes(normalized),
    );
    if (tag) {
      results.push({ cardId: card.id, matchKind: "tag", matchDetail: tag });
      seen.add(card.id);
      continue;
    }
    if (card.lore?.toLowerCase().includes(normalized)) {
      results.push({ cardId: card.id, matchKind: "lore" });
      seen.add(card.id);
    }
  }

  return results
    .sort((a, b) => {
      const cardA = cardsById.get(a.cardId);
      const cardB = cardsById.get(b.cardId);
      if (!cardA || !cardB) {
        return 0;
      }
      const scoreA = matchScore(a.matchKind, cardA.name, normalized);
      const scoreB = matchScore(b.matchKind, cardB.name, normalized);
      if (scoreA !== scoreB) {
        return scoreA - scoreB;
      }
      return cardA.name.localeCompare(cardB.name);
    })
    .slice(0, limit);
}

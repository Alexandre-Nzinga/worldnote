import type { WorldCard } from "@worldnote/shared";

export type CardSearchMatchKind = "name" | "tag" | "mention";

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

type ProseMirrorNode = {
  type?: string;
  attrs?: { id?: unknown; label?: unknown };
  content?: ProseMirrorNode[];
};

type DeltaDoc = {
  ops?: Array<{ insert?: unknown }>;
};

function emitMention(
  id: unknown,
  label: unknown,
  onMention: (id: string, label: string) => void,
): void {
  if (typeof id === "string" && typeof label === "string" && id && label) {
    onMention(id, label);
  }
}

/** Legacy ProseMirror/TipTap docs. */
function walkProseMirrorMentions(
  node: ProseMirrorNode | undefined,
  onMention: (id: string, label: string) => void,
): void {
  if (!node) {
    return;
  }
  if (node.type === "cardMention") {
    emitMention(node.attrs?.id, node.attrs?.label, onMention);
  }
  for (const child of node.content ?? []) {
    walkProseMirrorMentions(child, onMention);
  }
}

/** Current Quill Delta docs. */
function walkDeltaMentions(
  doc: DeltaDoc,
  onMention: (id: string, label: string) => void,
): void {
  for (const op of doc.ops ?? []) {
    const insert = op.insert;
    if (insert && typeof insert === "object") {
      const mention = (insert as Record<string, unknown>)["card-mention"];
      if (mention && typeof mention === "object") {
        const { id, label } = mention as { id?: unknown; label?: unknown };
        emitMention(id, label, onMention);
      }
    }
  }
}

function walkLoreDocMentions(
  doc: Record<string, unknown> | undefined,
  onMention: (id: string, label: string) => void,
): void {
  if (!doc || typeof doc !== "object") {
    return;
  }
  if (Array.isArray((doc as DeltaDoc).ops)) {
    walkDeltaMentions(doc as DeltaDoc, onMention);
    return;
  }
  if ((doc as ProseMirrorNode).type === "doc") {
    walkProseMirrorMentions(doc as ProseMirrorNode, onMention);
  }
}

function loreDocFromCard(card: WorldCard): Record<string, unknown> | undefined {
  const doc = card.lore_doc;
  if (doc && typeof doc === "object") {
    return doc as Record<string, unknown>;
  }
  return undefined;
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

  const mentionHits = new Map<string, CardSearchResult>();
  for (const card of cards) {
    walkLoreDocMentions(loreDocFromCard(card), (id, label) => {
      if (!label.toLowerCase().includes(normalized)) {
        return;
      }
      if (!cardsById.has(id)) {
        return;
      }
      if (!mentionHits.has(id)) {
        mentionHits.set(id, {
          cardId: id,
          matchKind: "mention",
          matchDetail: label,
        });
      }
    });
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
    }
  }

  for (const hit of mentionHits.values()) {
    if (!seen.has(hit.cardId)) {
      results.push(hit);
      seen.add(hit.cardId);
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

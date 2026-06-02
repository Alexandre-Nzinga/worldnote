import {
  CARD_TYPE_LABELS,
  type Link,
  SOCKET_REGISTRY,
  type WorldCard,
} from "@worldnote/shared";

export type SerializeCardContext = {
  cardsById: Record<string, WorldCard>;
  links: Link[];
};

/** Structural / non-creative fields that should never be sent to the LLM. */
const SKIP_KEYS = new Set<string>([
  "id",
  "card_type",
  "parent_id",
  "position",
  "image_path",
  "image_fit",
  "image_position",
  "lore_doc",
  "custom_properties",
]);

const LORE_MAX_CHARS = 600;

function formatValue(key: string, value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    if (key === "lore" && trimmed.length > LORE_MAX_CHARS) {
      return `${trimmed.slice(0, LORE_MAX_CHARS)}…`;
    }
    return trimmed;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    const items = value
      .map((item) => (typeof item === "string" ? item.trim() : String(item)))
      .filter((item) => item.length > 0);
    return items.length > 0 ? items.join(", ") : null;
  }
  return null;
}

function relationshipLines(
  card: WorldCard,
  context: SerializeCardContext,
): string[] {
  const sockets = SOCKET_REGISTRY[card.card_type as keyof typeof SOCKET_REGISTRY];
  if (!sockets) return [];

  const bySocket = new Map<string, string[]>();
  for (const link of context.links) {
    if (link.source_card !== card.id) continue;
    const target = context.cardsById[link.target_card];
    if (!target) continue;
    const existing = bySocket.get(link.source_socket) ?? [];
    existing.push(target.name);
    bySocket.set(link.source_socket, existing);
  }

  const lines: string[] = [];
  for (const [socketId, names] of bySocket) {
    const label = socketId.replace(/_/g, " ");
    lines.push(`${label} -> ${names.join(", ")}`);
  }
  return lines;
}

/**
 * Context pruning: turn a card (and its outgoing relationships) into a compact,
 * token-friendly block. Drops UUIDs, positions, image data and empty fields.
 */
export function serializeCardForLlm(
  card: WorldCard,
  context: SerializeCardContext,
): string {
  const typeLabel = CARD_TYPE_LABELS[card.card_type] ?? card.card_type;
  const fields: string[] = [`name: ${card.name}`];

  for (const [key, value] of Object.entries(card)) {
    if (key === "name" || SKIP_KEYS.has(key)) continue;
    const formatted = formatValue(key, value);
    if (formatted === null) continue;
    fields.push(`${key}: ${formatted}`);
  }

  const relationships = relationshipLines(card, context);
  if (relationships.length > 0) {
    fields.push(`relationships: ${relationships.join("; ")}`);
  }

  return `${typeLabel} {\n  ${fields.join("\n  ")}\n}`;
}

/** Serializes a list of cards into a single context block. */
export function serializeCardsForLlm(
  cards: WorldCard[],
  context: SerializeCardContext,
): string {
  return cards
    .map((card, index) => `Card ${index + 1}:\n${serializeCardForLlm(card, context)}`)
    .join("\n\n");
}

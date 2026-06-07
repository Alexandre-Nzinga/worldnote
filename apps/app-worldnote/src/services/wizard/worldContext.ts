import { invoke } from "@tauri-apps/api/core";
import { CARD_TYPE_LABELS, type Link, type WorldCard } from "@worldnote/shared";

import {
  serializeCardsForLlm,
  type SerializeCardContext,
} from "./serializeCardForLlm.js";

export type CardIndexRow = {
  id: string;
  name: string;
  tags: string[];
};

const MAX_CATALOG_LINES = 200;

/** Loads the world's SQLite card index (`.worldnote/index.db`). */
export async function fetchWorldCardIndex(
  vault: string,
): Promise<CardIndexRow[]> {
  return invoke<CardIndexRow[]>("list_card_index", { vault });
}

function catalogLine(
  card: WorldCard | undefined,
  indexRow: CardIndexRow | undefined,
): string {
  const name = card?.name ?? indexRow?.name ?? "Unknown";
  const typeLabel = card
    ? (CARD_TYPE_LABELS[card.card_type] ?? card.card_type)
    : "Card";
  const tags = (indexRow?.tags?.length ? indexRow.tags : card?.tags) ?? [];
  const tagPart = tags.length > 0 ? ` | tags: ${tags.join(", ")}` : "";
  const subtitle = card?.subtitle?.trim();
  const desc = card?.description?.trim() ?? card?.lore?.trim().split("\n")[0];
  const extra = subtitle || desc;
  const extraPart = extra
    ? ` | ${extra.length > 80 ? `${extra.slice(0, 80)}…` : extra}`
    : "";
  return `- ${typeLabel}: ${name}${tagPart}${extraPart}`;
}

export type WizardContextScope = "world" | "focused";

export type BuildWorldContextInput = {
  worldName: string;
  vaultPath: string;
  cardsById: Record<string, WorldCard>;
  links: Link[];
  indexRows: CardIndexRow[];
  /** Cards explicitly loaded into the wizard drop zone (full detail). */
  focusedCardIds?: string[];
  /** When `focused`, only focused cards are sent — not the full world catalog. */
  contextScope?: WizardContextScope;
};

/**
 * Builds the per-world, per-session context block sent with every wizard request.
 * Merges lore JSON (cardsById) with the SQLite index catalog.
 */
export function buildWorldContextMessage(
  input: BuildWorldContextInput,
): string {
  const {
    worldName,
    vaultPath,
    cardsById,
    links,
    indexRows,
    focusedCardIds = [],
    contextScope = "world",
  } = input;

  const serializeCtx: SerializeCardContext = { cardsById, links };
  const focusedCards = focusedCardIds
    .map((id) => cardsById[id])
    .filter((card): card is WorldCard => Boolean(card));

  if (contextScope === "focused" && focusedCards.length > 0) {
    const focusedIdSet = new Set(focusedCardIds);
    const focusedLinks = links.filter(
      (link) =>
        focusedIdSet.has(link.source_card) &&
        focusedIdSet.has(link.target_card),
    );

    const sections = [
      "[CURRENT WORLD]",
      `World: "${worldName}"`,
      `Vault: ${vaultPath}`,
      `Context scope: ${focusedCards.length} focus card(s) only. The full world catalog is not included.`,
      "The user may add more cards to the wizard or provide extra context in chat.",
      "",
      "--- Focus cards (full detail) ---",
      serializeCardsForLlm(focusedCards, serializeCtx),
    ];

    if (focusedLinks.length > 0) {
      sections.push(
        "",
        `--- Relationships between focus cards (${focusedLinks.length}) ---`,
        "Use the card names above when reasoning about these connections.",
      );
    }

    return sections.join("\n");
  }

  const indexById = new Map(indexRows.map((row) => [row.id, row]));
  const allIds = new Set<string>([
    ...Object.keys(cardsById),
    ...indexRows.map((row) => row.id),
  ]);

  const sortedIds = [...allIds].sort((a, b) => {
    const nameA = cardsById[a]?.name ?? indexById.get(a)?.name ?? "";
    const nameB = cardsById[b]?.name ?? indexById.get(b)?.name ?? "";
    return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
  });

  const catalogIds = sortedIds.slice(0, MAX_CATALOG_LINES);
  const catalogLines = catalogIds.map((id) =>
    catalogLine(cardsById[id], indexById.get(id)),
  );
  const truncated = sortedIds.length > MAX_CATALOG_LINES;

  const sections = [
    "[CURRENT WORLD]",
    `World: "${worldName}"`,
    `Vault: ${vaultPath}`,
    `You have read-only access to this world's local lore folder and SQLite search index (${sortedIds.length} card(s)).`,
    "Answer questions about cards in this world using the catalog and focused cards below. Do not claim you lack database or folder access.",
    "",
    `--- World catalog (${catalogIds.length}${truncated ? ` of ${sortedIds.length}` : ""}) ---`,
    catalogLines.join("\n"),
    truncated
      ? "\n(Catalog truncated for token limits; focused cards below have full detail.)"
      : "",
  ];

  if (links.length > 0) {
    sections.push(
      "",
      `--- Relationships (${links.length} link(s) in this world) ---`,
      "Use card names from the catalog when reasoning about connections.",
    );
  }

  if (focusedCards.length > 0) {
    sections.push(
      "",
      "--- Focus cards (loaded in wizard — full detail) ---",
      serializeCardsForLlm(focusedCards, serializeCtx),
    );
  }

  return sections.filter((line) => line !== undefined).join("\n");
}

/** Compact refresh key when world data changes during an open wizard session. */
export function worldContextFingerprint(
  vaultPath: string,
  cardsById: Record<string, WorldCard>,
  links: Link[],
  indexRows: CardIndexRow[],
): string {
  const cardCount = Object.keys(cardsById).length;
  const linkCount = links.length;
  const indexCount = indexRows.length;
  const namesHash = Object.values(cardsById)
    .map((c) => c.name)
    .sort()
    .join("|");
  return `${vaultPath}:${cardCount}:${linkCount}:${indexCount}:${namesHash}`;
}

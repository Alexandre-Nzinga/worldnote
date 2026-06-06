import { invoke } from "@tauri-apps/api/core";
import type { CardSearchMatchKind } from "../canvas/searchCanvasCards.js";

export type CardIndexSearchHit = {
  id: string;
  name: string;
  tags: string[];
  matchKind: CardSearchMatchKind;
  matchDetail?: string;
};

function parseMatchKind(value: string): CardSearchMatchKind {
  if (value === "tag" || value === "lore") {
    return value;
  }
  return "name";
}

/** Searches a world's SQLite card index (name, tags, lore). */
export async function searchCardIndex(
  vault: string,
  query: string,
  limit = 20,
): Promise<CardIndexSearchHit[]> {
  const hits = await invoke<
    Array<{
      id: string;
      name: string;
      tags: string[];
      matchKind: string;
      matchDetail?: string;
    }>
  >("search_card_index", { vault, query, limit });
  return hits.map((hit) => ({
    id: hit.id,
    name: hit.name,
    tags: hit.tags,
    matchKind: parseMatchKind(hit.matchKind),
    matchDetail: hit.matchDetail,
  }));
}

import { invoke } from "@tauri-apps/api/core";
import type { LibraryCard } from "./listAllCards.js";

/** Searches cards across all worlds via each world's SQLite index. */
export async function searchAllCards(
  root: string,
  query: string,
): Promise<LibraryCard[]> {
  return invoke<LibraryCard[]>("search_all_cards", { root, query });
}

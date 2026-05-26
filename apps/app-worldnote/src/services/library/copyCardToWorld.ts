import { invoke } from "@tauri-apps/api/core";
import type { LibraryCard } from "./listAllCards.js";

export type CopyPosition = { x: number; y: number };

export async function copyCardToWorld(args: {
  sourceWorldPath: string;
  targetWorldPath: string;
  cardId: string;
  position: CopyPosition;
}): Promise<LibraryCard> {
  return invoke<LibraryCard>("copy_card_to_world", args);
}


import { invoke } from "@tauri-apps/api/core";

export type LibraryCard = {
  worldPath: string;
  worldName: string;
  worldCoverImage?: string;
  cardId: string;
  cardType: string;
  name: string;
  createdAt: number;
  imagePath?: string;
};

export async function listAllCards(root: string): Promise<LibraryCard[]> {
  return invoke<LibraryCard[]>("list_all_cards", { root });
}


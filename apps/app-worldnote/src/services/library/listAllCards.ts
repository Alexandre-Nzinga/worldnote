import { invoke } from "@tauri-apps/api/core";

export type LibraryCardImagePosition = {
  x: number;
  y: number;
};

export type LibraryCard = {
  worldPath: string;
  worldName: string;
  worldCoverImage?: string;
  cardId: string;
  cardType: string;
  name: string;
  createdAt: number;
  imagePath?: string;
  imageFit?: string;
  imagePosition?: LibraryCardImagePosition;
  subtitle: string;
};

export async function listAllCards(root: string): Promise<LibraryCard[]> {
  return invoke<LibraryCard[]>("list_all_cards", { root });
}


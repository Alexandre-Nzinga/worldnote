import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { DESKTOP_ONLY_MESSAGE, isTauriRuntime } from "./tauriRuntime.js";

/** File extensions accepted for card cover and lore images. */
export const CARD_IMAGE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "svg",
  "avif",
] as const;

export async function pickCardImageFile(): Promise<string | null> {
  if (!isTauriRuntime()) {
    throw new Error(DESKTOP_ONLY_MESSAGE);
  }

  const selection = await open({
    multiple: false,
    filters: [
      {
        name: "Images",
        extensions: [...CARD_IMAGE_EXTENSIONS],
      },
    ],
    title: "Choose a card image",
  });

  if (selection === null || Array.isArray(selection)) {
    return null;
  }

  return selection;
}

export async function saveCardImage(
  vault: string,
  cardId: string,
  sourcePath: string,
): Promise<string> {
  return invoke<string>("save_card_image", {
    vault,
    cardId,
    sourcePath,
  });
}

export async function addCardLoreImage(
  vault: string,
  cardId: string,
  sourcePath: string,
): Promise<string> {
  return invoke<string>("add_card_lore_image", {
    vault,
    cardId,
    sourcePath,
  });
}

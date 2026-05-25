import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { DESKTOP_ONLY_MESSAGE, isTauriRuntime } from "./tauriRuntime.js";

export async function pickCardImageFile(): Promise<string | null> {
  if (!isTauriRuntime()) {
    throw new Error(DESKTOP_ONLY_MESSAGE);
  }

  const selection = await open({
    multiple: false,
    filters: [
      {
        name: "Images",
        extensions: ["png", "jpg", "jpeg", "webp", "gif"],
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

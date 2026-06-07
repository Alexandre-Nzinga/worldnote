import { invoke } from "@tauri-apps/api/core";
import { confirm, message } from "@tauri-apps/plugin-dialog";
import type { WorldCard } from "@worldnote/shared";
import { DESKTOP_ONLY_MESSAGE, isTauriRuntime } from "./tauriRuntime.js";

/**
 * Prompts the user, then opens a pretty-printed JSON snapshot of the card in the
 * system's default application (VS Code, Notepad++, etc.).
 */
export async function openCardJsonInExternalApp(
  card: WorldCard,
): Promise<void> {
  if (!isTauriRuntime()) {
    await message(DESKTOP_ONLY_MESSAGE, {
      title: "View card JSON",
      kind: "warning",
    });
    return;
  }

  const confirmed = await confirm(
    "Open this card as formatted JSON in your default editor?\n\nThe file is a snapshot of what you see in the inspector (including unsaved edits). Save the card first if you need the on-disk file in your vault.",
    {
      title: "View raw JSON",
      kind: "info",
      okLabel: "Open",
      cancelLabel: "Cancel",
    },
  );
  if (!confirmed) {
    return;
  }

  try {
    await invoke<string>("open_card_json", {
      cardId: card.id,
      card,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    await message(`Could not open card JSON.\n\n${detail}`, {
      title: "View card JSON",
      kind: "error",
    });
  }
}

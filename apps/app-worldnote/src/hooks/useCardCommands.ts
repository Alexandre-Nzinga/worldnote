import { invoke } from "@tauri-apps/api/core";

export function useCardCommands() {
  return {
    listCards: () => invoke<string[]>("list_cards_stub"),
    saveCard: (id: string, payload: unknown) =>
      invoke<void>("save_card_stub", { id, payload }),
  };
}

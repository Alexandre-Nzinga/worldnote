import { invoke } from "@tauri-apps/api/core";

export async function deleteWorldCard(
  vault: string,
  cardId: string,
): Promise<void> {
  await invoke<void>("delete_card", { vault, id: cardId });
}

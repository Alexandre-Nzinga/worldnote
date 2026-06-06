import { invoke } from "@tauri-apps/api/core";
import { trackPersist } from "../../hooks/useSaveStatus.js";

export async function deleteWorldCard(
  vault: string,
  cardId: string,
): Promise<void> {
  return trackPersist(async () => {
    await invoke<void>("delete_card", { vault, id: cardId });
  });
}

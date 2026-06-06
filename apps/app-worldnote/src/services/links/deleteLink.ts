import { invoke } from "@tauri-apps/api/core";
import { trackPersist } from "../../hooks/useSaveStatus.js";

export async function deleteLink(vault: string, linkId: string): Promise<void> {
  return trackPersist(async () => {
    await invoke<void>("delete_link", { vault, id: linkId });
  });
}

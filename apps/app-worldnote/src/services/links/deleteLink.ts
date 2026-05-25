import { invoke } from "@tauri-apps/api/core";

export async function deleteLink(vault: string, linkId: string): Promise<void> {
  await invoke<void>("delete_link", { vault, id: linkId });
}

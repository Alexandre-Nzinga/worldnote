import { invoke } from "@tauri-apps/api/core";

export async function deleteWorld(worldPath: string): Promise<void> {
  return invoke<void>("delete_world", { worldPath });
}

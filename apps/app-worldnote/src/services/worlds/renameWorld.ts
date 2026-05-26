import { invoke } from "@tauri-apps/api/core";

export async function renameWorld(
  worldPath: string,
  newName: string,
): Promise<string> {
  return invoke<string>("rename_world", { worldPath, newName });
}

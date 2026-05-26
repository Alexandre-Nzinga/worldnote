import { invoke } from "@tauri-apps/api/core";

export async function saveWorldCover(
  worldPath: string,
  sourcePath: string,
): Promise<string> {
  return invoke<string>("save_world_cover", { worldPath, sourcePath });
}

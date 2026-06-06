import { invoke } from "@tauri-apps/api/core";
import { trackPersist } from "../../hooks/useSaveStatus.js";

export async function saveWorldCover(
  worldPath: string,
  sourcePath: string,
): Promise<string> {
  return trackPersist(() =>
    invoke<string>("save_world_cover", { worldPath, sourcePath }),
  );
}

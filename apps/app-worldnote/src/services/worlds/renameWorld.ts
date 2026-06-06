import { invoke } from "@tauri-apps/api/core";
import { trackPersist } from "../../hooks/useSaveStatus.js";

export async function renameWorld(
  worldPath: string,
  newName: string,
): Promise<string> {
  return trackPersist(() =>
    invoke<string>("rename_world", { worldPath, newName }),
  );
}

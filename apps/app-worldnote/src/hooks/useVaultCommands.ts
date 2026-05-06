import { invoke } from "@tauri-apps/api/core";

/** Route layer (TS) — thin wrappers over Tauri IPC. */
export function useVaultCommands() {
  return {
    openWorldFolder: (path: string) =>
      invoke<string>("open_world_folder", { path }),
    createWorld: (root: string) =>
      invoke<string>("create_world_stub", { root }),
  };
}

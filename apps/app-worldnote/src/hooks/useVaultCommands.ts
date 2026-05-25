import { invoke } from "@tauri-apps/api/core";
import { useMemo } from "react";

/** Route layer (TS) — thin wrappers over Tauri IPC. */
export function useVaultCommands() {
  return useMemo(
    () => ({
      openWorld: (root: string) => invoke<string>("open_world", { root }),
      createWorld: (args: { root: string; name: string; description: string }) =>
        invoke<string>("create_world", args),
    }),
    [],
  );
}

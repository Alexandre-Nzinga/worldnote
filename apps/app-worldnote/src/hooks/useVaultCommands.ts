import { invoke } from "@tauri-apps/api/core";
import { useMemo } from "react";

/** Route layer (TS) — thin wrappers over Tauri IPC. */
export function useVaultCommands() {
  return useMemo(
    () => ({
      openWorld: (root: string) => invoke<string>("open_world", { root }),
      createWorld: (args: { root: string; name: string; description: string }) =>
        invoke<string>("create_world", args),
      saveWorldCover: (worldPath: string, sourcePath: string) =>
        invoke<string>("save_world_cover", { worldPath, sourcePath }),
      renameWorld: (worldPath: string, newName: string) =>
        invoke<string>("rename_world", { worldPath, newName }),
      deleteWorld: (worldPath: string) =>
        invoke<void>("delete_world", { worldPath }),
      listAllCards: (root: string) =>
        invoke<
          Array<{
            worldPath: string;
            worldName: string;
            worldCoverImage?: string;
            cardId: string;
            cardType: string;
            name: string;
            createdAt: number;
            imagePath?: string;
          }>
        >("list_all_cards", { root }),
      copyCardToWorld: (args: {
        sourceWorldPath: string;
        targetWorldPath: string;
        cardId: string;
        position: { x: number; y: number };
      }) => invoke("copy_card_to_world", args),
    }),
    [],
  );
}

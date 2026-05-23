import type { CanvasManifest, CanvasNodePlacement } from "@worldnote/canvas";
import { invoke } from "@tauri-apps/api/core";
import type { WorldCard } from "@worldnote/shared";
import { useMemo } from "react";

export function useCardCommands() {
  return useMemo(
    () => ({
      upsertCard: (vault: string, card: WorldCard) =>
        invoke<void>("upsert_card", { vault, card }),
      listCards: (vault: string) =>
        invoke<WorldCard[]>("list_cards", { vault }),
      loadCanvasManifest: (vault: string) =>
        invoke<CanvasManifest>("load_canvas_manifest", { vault }),
      updateCanvasManifest: (vault: string, manifest: CanvasManifest) =>
        invoke<void>("update_canvas_manifest", { vault, manifest }),
      updateCanvasManifestNode: (
        vault: string,
        placement: CanvasNodePlacement,
      ) => invoke<void>("update_canvas_manifest_node", { vault, placement }),
    }),
    [],
  );
}

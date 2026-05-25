import type { CanvasManifest, CanvasNodePlacement } from "@worldnote/canvas";
import { invoke } from "@tauri-apps/api/core";
import type { Link, WorldCard } from "@worldnote/shared";
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
      deleteCard: (vault: string, cardId: string) =>
        invoke<void>("delete_card", { vault, id: cardId }),
      saveCardImage: (vault: string, cardId: string, sourcePath: string) =>
        invoke<string>("save_card_image", { vault, cardId, sourcePath }),
      listLinks: (vault: string) => invoke<Link[]>("list_links", { vault }),
      upsertLink: (vault: string, link: Link) =>
        invoke<void>("upsert_link", { vault, link }),
      deleteLink: (vault: string, linkId: string) =>
        invoke<void>("delete_link", { vault, id: linkId }),
    }),
    [],
  );
}

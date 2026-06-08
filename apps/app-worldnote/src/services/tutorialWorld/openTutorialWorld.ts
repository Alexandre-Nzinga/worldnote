import { invoke } from "@tauri-apps/api/core";
import type { WorldCard } from "@worldnote/shared";
import { loadCanvasManifest } from "../canvas/canvasManifest.js";
import { buildStarterPackWorld } from "../starterPacks/buildStarterPack.js";
import type { StarterPackBuildResult } from "../starterPacks/types.js";
import { TUTORIAL_WORLD_PACK } from "./tutorialWorldPack.js";

function readTutorialAnchor(
  customProperties: Record<string, string | number | boolean> | undefined,
): string | undefined {
  const value = customProperties?.tutorial_anchor;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

async function loadTutorialAnchorMaps(
  worldPath: string,
): Promise<
  Pick<
    StarterPackBuildResult,
    "cardAnchorMap" | "stickyNoteAnchorMap" | "canvasImageAnchorMap"
  >
> {
  const [cards, manifest] = await Promise.all([
    invoke<WorldCard[]>("list_cards", { vault: worldPath }),
    loadCanvasManifest(worldPath),
  ]);

  const cardAnchorMap: Record<string, string> = {};
  for (const card of cards) {
    const anchor = readTutorialAnchor(card.custom_properties);
    if (anchor) {
      cardAnchorMap[anchor] = card.id;
    }
  }

  const stickyNoteAnchorMap: Record<string, string> = {};
  const firstNote = manifest.stickyNotes?.[0];
  if (firstNote) {
    stickyNoteAnchorMap["sample-note"] = firstNote.id;
  }

  const canvasImageAnchorMap: Record<string, string> = {};
  const firstImage = manifest.images?.[0];
  if (firstImage) {
    canvasImageAnchorMap["tutorial-image"] = firstImage.id;
  }

  return { cardAnchorMap, stickyNoteAnchorMap, canvasImageAnchorMap };
}

/** Opens or creates the dedicated tutorial world and returns anchor maps for the tour. */
export async function openTutorialWorld(
  root: string,
): Promise<StarterPackBuildResult> {
  const result = await buildStarterPackWorld(root, TUTORIAL_WORLD_PACK);

  if (result.created) {
    return result;
  }

  const anchors = await loadTutorialAnchorMaps(result.path);
  return { ...result, ...anchors };
}

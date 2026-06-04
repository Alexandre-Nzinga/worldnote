import type {
  CanvasImagePlacement,
  CanvasManifest,
  CanvasNodePlacement,
  StickyNotePlacement,
} from "@worldnote/canvas";
import { invoke } from "@tauri-apps/api/core";

export async function loadCanvasManifest(
  vault: string,
): Promise<CanvasManifest> {
  return invoke<CanvasManifest>("load_canvas_manifest", { vault });
}

export async function updateCanvasManifest(
  vault: string,
  manifest: CanvasManifest,
): Promise<void> {
  return invoke<void>("update_canvas_manifest", { vault, manifest });
}

export async function updateCanvasManifestNode(
  vault: string,
  placement: CanvasNodePlacement,
): Promise<void> {
  return invoke<void>("update_canvas_manifest_node", { vault, placement });
}

export async function updateCanvasManifestImage(
  vault: string,
  placement: CanvasImagePlacement,
): Promise<void> {
  return invoke<void>("update_canvas_manifest_image", { vault, placement });
}

export async function removeCanvasManifestImage(
  vault: string,
  imageId: string,
): Promise<void> {
  return invoke<void>("remove_canvas_manifest_image", { vault, imageId });
}

export async function updateCanvasManifestStickyNote(
  vault: string,
  placement: StickyNotePlacement,
): Promise<void> {
  return invoke<void>("update_canvas_manifest_sticky_note", { vault, placement });
}

export async function removeCanvasManifestStickyNote(
  vault: string,
  stickyNoteId: string,
): Promise<void> {
  return invoke<void>("remove_canvas_manifest_sticky_note", {
    vault,
    stickyNoteId,
  });
}

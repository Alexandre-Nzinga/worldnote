import type { CanvasNodePlacement } from "@worldnote/canvas";
import { updateCanvasManifestNode } from "./canvasManifest.js";

export function createCardPositionUpdater(vault: string, debounceMs = 300) {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  return (placement: CanvasNodePlacement) => {
    const existing = timers.get(placement.cardId);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(async () => {
      timers.delete(placement.cardId);
      await updateCanvasManifestNode(vault, placement);
    }, debounceMs);
    timers.set(placement.cardId, timer);
  };
}

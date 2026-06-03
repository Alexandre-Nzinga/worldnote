import type { CanvasImagePlacement } from "@worldnote/canvas";
import { updateCanvasManifestImage } from "./canvasManifest.js";

export function createCanvasImagePositionUpdater(vault: string, debounceMs = 300) {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  return (placement: CanvasImagePlacement) => {
    const existing = timers.get(placement.id);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(async () => {
      timers.delete(placement.id);
      await updateCanvasManifestImage(vault, placement);
    }, debounceMs);
    timers.set(placement.id, timer);
  };
}

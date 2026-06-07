import {
  canvasImageNodeStyle,
  type CanvasImagePlacement,
  type ImageFlowNode,
  type ImageNodeData,
} from "@worldnote/canvas";
import { normalizeCardImageDisplay } from "@worldnote/shared";
import { cardImageSrc } from "./cardNodeData.js";

export function vaultAbsoluteImagePath(
  vaultPath: string,
  imagePath: string,
): string {
  const base = vaultPath.replace(/\\/g, "/").replace(/\/$/, "");
  const relative = imagePath.replace(/\\/g, "/");
  return `${base}/${relative}`;
}

export function imagePlacementToFlowNode(
  placement: CanvasImagePlacement,
  vaultPath: string,
  options?: { selected?: boolean; enterAnimation?: boolean },
): ImageFlowNode | null {
  const imageSrc = cardImageSrc(vaultPath, placement.imagePath);
  if (!imageSrc) {
    return null;
  }

  const data: ImageNodeData = {
    imageSrc,
    imagePath: placement.imagePath,
    imagePosition: normalizeCardImageDisplay(undefined, placement.imagePosition)
      .position,
    enterAnimation: options?.enterAnimation,
  };

  return {
    id: placement.id,
    type: "worldnoteImage",
    position: { x: placement.x, y: placement.y },
    connectable: false,
    selected: options?.selected,
    style: canvasImageNodeStyle(placement.width, placement.height),
    data,
  };
}

import type { CanvasImagePlacement, ImageFlowNode } from "@worldnote/canvas";
import {
  DEFAULT_CARD_IMAGE_POSITION,
  normalizeCardImageDisplay,
} from "@worldnote/shared";

export function canvasImagePlacementFromFlowNode(
  node: ImageFlowNode,
): CanvasImagePlacement {
  const width =
    typeof node.style?.width === "number" ? node.style.width : undefined;
  const height =
    typeof node.style?.height === "number" ? node.style.height : undefined;

  return {
    id: node.id,
    x: node.position.x,
    y: node.position.y,
    imagePath: node.data.imagePath,
    width,
    height,
    imagePosition: node.data.imagePosition,
  };
}

export function defaultCanvasImageNodePosition() {
  return normalizeCardImageDisplay(undefined, DEFAULT_CARD_IMAGE_POSITION)
    .position;
}

export function canvasImageNodeWithPosition(
  node: ImageFlowNode,
  imagePosition: ReturnType<typeof defaultCanvasImageNodePosition>,
): ImageFlowNode {
  return {
    ...node,
    data: {
      ...node.data,
      imagePosition,
    },
  };
}

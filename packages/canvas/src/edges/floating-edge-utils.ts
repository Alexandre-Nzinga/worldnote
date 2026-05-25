import { Position, type InternalNode } from "@xyflow/react";

type SideAnchor = {
  x: number;
  y: number;
  position: Position;
};

export type FloatingEdgeParams = {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  sourcePosition: Position;
  targetPosition: Position;
};

type FloatingEdgeOptions = {
  /** Flow Y from the source handle (keeps edge aligned with socket row). */
  sourceHandleY?: number;
  /** Flow Y from the target handle (keeps edge aligned with socket row). */
  targetHandleY?: number;
};

function sideAnchor(
  node: InternalNode,
  other: InternalNode,
  handleY?: number,
): SideAnchor {
  const { x: nodeX, y: nodeY } = node.internals.positionAbsolute;
  const width = node.measured.width ?? 0;
  const height = node.measured.height ?? 0;
  const { x: otherX } = other.internals.positionAbsolute;
  const otherWidth = other.measured.width ?? 0;

  const nodeCenterX = nodeX + width / 2;
  const otherCenterX = otherX + otherWidth / 2;
  const useRight = otherCenterX > nodeCenterX;

  return {
    x: nodeX + (useRight ? width : 0),
    y: handleY ?? nodeY + height / 2,
    position: useRight ? Position.Right : Position.Left,
  };
}

/**
 * Anchor link endpoints to the left or right side of each card.
 * Y uses React Flow handle positions so edges line up with per-socket dots.
 */
export function getFloatingEdgeParams(
  source: InternalNode,
  target: InternalNode,
  options?: FloatingEdgeOptions,
): FloatingEdgeParams {
  const sourceAnchor = sideAnchor(source, target, options?.sourceHandleY);
  const targetAnchor = sideAnchor(target, source, options?.targetHandleY);

  return {
    sx: sourceAnchor.x,
    sy: sourceAnchor.y,
    sourcePosition: sourceAnchor.position,
    tx: targetAnchor.x,
    ty: targetAnchor.y,
    targetPosition: targetAnchor.position,
  };
}

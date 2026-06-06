/** Matches canvas dot background gap in `CanvasFlow`. */
export const CANVAS_SNAP_GRID_SIZE = 16;

export type CanvasAlignAction =
  | "align-left"
  | "align-center-h"
  | "align-right"
  | "align-top"
  | "align-center-v"
  | "align-bottom";

export type CanvasDistributeAction = "distribute-h" | "distribute-v";

export type CanvasLayoutAction =
  | { type: "snap-to-grid" }
  | { type: "align"; alignment: CanvasAlignAction }
  | { type: "distribute"; axis: CanvasDistributeAction };

export type FlowNodeLayoutInput = {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
};

export type NodeOrigin = readonly [number, number];

type NodeRect = FlowNodeLayoutInput & {
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
};

export function snapScalarToGrid(
  value: number,
  gridSize = CANVAS_SNAP_GRID_SIZE,
): number {
  return Math.round(value / gridSize) * gridSize;
}

export function snapFlowPosition(
  position: { x: number; y: number },
  gridSize = CANVAS_SNAP_GRID_SIZE,
): { x: number; y: number } {
  return {
    x: snapScalarToGrid(position.x, gridSize),
    y: snapScalarToGrid(position.y, gridSize),
  };
}

export function flowNodeLayoutInputFromNode(
  node: {
    id: string;
    position: { x: number; y: number };
    measured?: { width?: number; height?: number };
  },
  fallbackSize: { width: number; height: number } = {
    width: 200,
    height: 180,
  },
): FlowNodeLayoutInput {
  const measuredWidth = node.measured?.width;
  const measuredHeight = node.measured?.height;
  return {
    id: node.id,
    position: node.position,
    width:
      measuredWidth && measuredWidth > 0 ? measuredWidth : fallbackSize.width,
    height:
      measuredHeight && measuredHeight > 0
        ? measuredHeight
        : fallbackSize.height,
  };
}

function toNodeRect(
  node: FlowNodeLayoutInput,
  nodeOrigin: NodeOrigin,
): NodeRect {
  const [originX, originY] = nodeOrigin;
  const left = node.position.x - node.width * originX;
  const top = node.position.y - node.height * originY;
  const right = left + node.width;
  const bottom = top + node.height;
  return {
    ...node,
    left,
    top,
    right,
    bottom,
    centerX: left + node.width / 2,
    centerY: top + node.height / 2,
  };
}

function positionFromRect(
  rect: NodeRect,
  left: number,
  top: number,
  nodeOrigin: NodeOrigin,
): { x: number; y: number } {
  const [originX, originY] = nodeOrigin;
  return {
    x: left + rect.width * originX,
    y: top + rect.height * originY,
  };
}

function alignRects(
  rects: NodeRect[],
  alignment: CanvasAlignAction,
  nodeOrigin: NodeOrigin,
): Map<string, { x: number; y: number }> {
  if (rects.length < 2) {
    return new Map();
  }

  const minLeft = Math.min(...rects.map((rect) => rect.left));
  const maxRight = Math.max(...rects.map((rect) => rect.right));
  const minTop = Math.min(...rects.map((rect) => rect.top));
  const maxBottom = Math.max(...rects.map((rect) => rect.bottom));
  const centerX = (minLeft + maxRight) / 2;
  const centerY = (minTop + maxBottom) / 2;

  const updates = new Map<string, { x: number; y: number }>();
  for (const rect of rects) {
    let nextLeft = rect.left;
    let nextTop = rect.top;

    switch (alignment) {
      case "align-left":
        nextLeft = minLeft;
        break;
      case "align-center-h":
        nextLeft = centerX - rect.width / 2;
        break;
      case "align-right":
        nextLeft = maxRight - rect.width;
        break;
      case "align-top":
        nextTop = minTop;
        break;
      case "align-center-v":
        nextTop = centerY - rect.height / 2;
        break;
      case "align-bottom":
        nextTop = maxBottom - rect.height;
        break;
      default:
        break;
    }

    updates.set(rect.id, positionFromRect(rect, nextLeft, nextTop, nodeOrigin));
  }

  return updates;
}

function distributeRects(
  rects: NodeRect[],
  axis: CanvasDistributeAction,
  nodeOrigin: NodeOrigin,
): Map<string, { x: number; y: number }> {
  if (rects.length < 3) {
    return new Map();
  }

  const sorted = [...rects].sort((a, b) =>
    axis === "distribute-h" ? a.left - b.left : a.top - b.top,
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const updates = new Map<string, { x: number; y: number }>();

  if (axis === "distribute-h") {
    const span = last.right - first.left;
    const innerWidth = sorted
      .slice(1, -1)
      .reduce((sum, rect) => sum + rect.width, 0);
    const gap = (span - first.width - innerWidth - last.width) / (sorted.length - 1);
    let cursor = first.left + first.width + gap;

    updates.set(
      first.id,
      positionFromRect(first, first.left, first.top, nodeOrigin),
    );
    for (const rect of sorted.slice(1, -1)) {
      updates.set(
        rect.id,
        positionFromRect(rect, cursor, rect.top, nodeOrigin),
      );
      cursor += rect.width + gap;
    }
    updates.set(
      last.id,
      positionFromRect(last, last.left, last.top, nodeOrigin),
    );
    return updates;
  }

  const span = last.bottom - first.top;
  const innerHeight = sorted
    .slice(1, -1)
    .reduce((sum, rect) => sum + rect.height, 0);
  const gap = (span - first.height - innerHeight - last.height) / (sorted.length - 1);
  let cursor = first.top + first.height + gap;

  updates.set(
    first.id,
    positionFromRect(first, first.left, first.top, nodeOrigin),
  );
  for (const rect of sorted.slice(1, -1)) {
    updates.set(
      rect.id,
      positionFromRect(rect, rect.left, cursor, nodeOrigin),
    );
    cursor += rect.height + gap;
  }
  updates.set(
    last.id,
    positionFromRect(last, last.left, last.top, nodeOrigin),
  );
  return updates;
}

export function applyCanvasLayoutAction(
  nodes: FlowNodeLayoutInput[],
  action: CanvasLayoutAction,
  nodeOrigin: NodeOrigin = [0.5, 0],
): Map<string, { x: number; y: number }> {
  if (nodes.length === 0) {
    return new Map();
  }

  if (action.type === "snap-to-grid") {
    const updates = new Map<string, { x: number; y: number }>();
    for (const node of nodes) {
      updates.set(node.id, snapFlowPosition(node.position));
    }
    return updates;
  }

  const rects = nodes.map((node) => toNodeRect(node, nodeOrigin));

  if (action.type === "align") {
    return alignRects(rects, action.alignment, nodeOrigin);
  }

  return distributeRects(rects, action.axis, nodeOrigin);
}

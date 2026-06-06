/** Matches canvas dot background gap in `CanvasFlow`. */
export const CANVAS_SNAP_GRID_SIZE = 16;

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

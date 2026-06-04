export type CanvasFlowPointer = { x: number; y: number };

export type ResolveCanvasSpawnPositionOptions = {
  /** Use this flow position instead of the last pointer / viewport center. */
  explicit?: CanvasFlowPointer;
  /** Shift spawn so a top-left anchor (e.g. images) sits on the pointer. */
  anchorOffset?: CanvasFlowPointer;
  /** Spawn in the center of the visible canvas (toolbar, menus, etc.). */
  preferViewportCenter?: boolean;
};

export type ResolveCanvasSpawnPosition = (
  options?: ResolveCanvasSpawnPositionOptions,
) => CanvasFlowPointer;

/** Center imported images on the pointer (default canvas image size). */
export const CANVAS_IMAGE_SPAWN_ANCHOR_OFFSET: CanvasFlowPointer = {
  x: 160,
  y: 120,
};

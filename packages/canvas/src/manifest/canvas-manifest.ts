/**
 * Canvas manifest — maps card UUID → placement per view.
 */
export type CanvasNodePlacement = {
  cardId: string;
  x: number;
  y: number;
  z?: number;
};

export type CanvasManifest = {
  id: string;
  name: string;
  version: number;
  nodes: CanvasNodePlacement[];
};

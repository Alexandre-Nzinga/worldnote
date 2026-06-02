/**
 * Canvas manifest — maps card UUID → placement per view.
 */
export type CanvasNodePlacement = {
  cardId: string;
  x: number;
  y: number;
  z?: number;
};

/** Canvas sticky note (TipTap lore_doc + placement). */
export type StickyNotePlacement = {
  id: string;
  x: number;
  y: number;
  z?: number;
  lore?: string;
  lore_doc?: Record<string, unknown>;
};

export type CanvasManifest = {
  id: string;
  name: string;
  version: number;
  nodes: CanvasNodePlacement[];
  stickyNotes?: StickyNotePlacement[];
};

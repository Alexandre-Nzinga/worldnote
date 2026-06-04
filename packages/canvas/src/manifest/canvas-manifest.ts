import type { CardImagePosition } from "../nodes/card-image-display.js";

/**
 * Canvas manifest — maps card UUID → placement per view.
 */
export type CanvasNodePlacement = {
  cardId: string;
  x: number;
  y: number;
  z?: number;
};

/** Canvas sticky note layout (body stored in sticky-notes/{id}.md). */
export type StickyNotePlacement = {
  id: string;
  x: number;
  y: number;
  z?: number;
  heading?: string;
  color?: string;
  width?: number;
  height?: number;
};

/** Freestanding image on the canvas (not tied to a card). */
export type CanvasImagePlacement = {
  id: string;
  x: number;
  y: number;
  z?: number;
  imagePath: string;
  width?: number;
  height?: number;
  /** Pan, zoom, rotation, and flip inside the image frame. */
  imagePosition?: CardImagePosition;
};

export type CanvasManifest = {
  id: string;
  name: string;
  version: number;
  nodes: CanvasNodePlacement[];
  stickyNotes?: StickyNotePlacement[];
  images?: CanvasImagePlacement[];
};



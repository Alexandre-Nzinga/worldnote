import type { CardNodeSelectModifiers } from "@worldnote/canvas";

export type ApplyCanvasCardSelection = (
  cardId: string,
  modifiers: CardNodeSelectModifiers,
) => void;

/** Set from Canvas so card nodes and connection-end can drive selection. */
export const applyCanvasCardSelectionRef: {
  current: ApplyCanvasCardSelection | null;
} = { current: null };

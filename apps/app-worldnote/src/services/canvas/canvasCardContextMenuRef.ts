export type CardContextMenuPointer = {
  clientX: number;
  clientY: number;
};

export type OpenCanvasCardContextMenu = (
  cardId: string,
  pointer: CardContextMenuPointer,
) => void;

/** Set from Canvas so card nodes can open the context menu on right-click. */
export const openCanvasCardContextMenuRef: {
  current: OpenCanvasCardContextMenu | null;
} = { current: null };

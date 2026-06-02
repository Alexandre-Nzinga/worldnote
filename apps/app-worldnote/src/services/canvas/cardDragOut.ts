import type { DragEvent } from "react";

/** MIME type for cards dragged out of the canvas into the WorldWizard. */
export const WIZARD_CARD_MIME = "application/worldnote-canvas-card";

/**
 * Fallback payload in `text/plain` — WebView2 often hides custom MIME types during
 * `dragover`, but always lists `text/plain`.
 */
export const WIZARD_CARD_PLAIN_PREFIX = "worldnote/canvas-card:";

export function canvasCardPlainPayload(cardId: string): string {
  return `${WIZARD_CARD_PLAIN_PREFIX}${cardId}`;
}

/** Builds an `onDragStart` handler that carries a card id out of the canvas. */
export function makeCardDragStartHandler(
  cardId: string,
  cardName: string,
): (event: DragEvent<HTMLDivElement>) => void {
  return (event) => {
    event.stopPropagation();
    event.dataTransfer.setData(WIZARD_CARD_MIME, JSON.stringify({ cardId }));
    event.dataTransfer.setData("text/plain", canvasCardPlainPayload(cardId));
    event.dataTransfer.setData("text/uri-list", cardName);
    event.dataTransfer.effectAllowed = "copy";
  };
}

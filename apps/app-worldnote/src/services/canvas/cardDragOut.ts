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

export type VaultCardRefPayload = {
  sourceWorldPath: string;
  cardId: string;
};

export function readVaultCardRefPayload(
  raw: string,
): VaultCardRefPayload | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      "sourceWorldPath" in parsed &&
      "cardId" in parsed &&
      typeof parsed.sourceWorldPath === "string" &&
      typeof parsed.cardId === "string"
    ) {
      return {
        sourceWorldPath: parsed.sourceWorldPath,
        cardId: parsed.cardId,
      };
    }
  } catch {
    // ignore invalid drag payloads
  }
  return null;
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

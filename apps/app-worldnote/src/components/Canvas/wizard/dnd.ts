import { isCardExternalPointerDragActive } from "@worldnote/canvas";
import {
  WIZARD_CARD_MIME,
  WIZARD_CARD_PLAIN_PREFIX,
} from "../../../services/canvas/cardDragOut.js";

export { WIZARD_CARD_MIME };

/** Vault chips already use this MIME (same-world cards land in `cardsById`). */
export const VAULT_CARD_REF_MIME = "application/worldnote-card-ref";

export type WizardCardDragPayload = {
  cardId: string;
};

function readCardIdFromPayload(raw: string): string | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      "cardId" in parsed &&
      typeof parsed.cardId === "string" &&
      parsed.cardId.length > 0
    ) {
      return parsed.cardId;
    }
  } catch {
    // fall through
  }
  return null;
}

/** Reads a card id from a drag event, supporting both canvas and vault sources. */
export function readDraggedCardId(dataTransfer: DataTransfer): string | null {
  const canvasRaw = dataTransfer.getData(WIZARD_CARD_MIME);
  if (canvasRaw) {
    const cardId = readCardIdFromPayload(canvasRaw);
    if (cardId) return cardId;
  }

  const vaultRaw = dataTransfer.getData(VAULT_CARD_REF_MIME);
  if (vaultRaw) {
    const cardId = readCardIdFromPayload(vaultRaw);
    if (cardId) return cardId;
  }

  const plain = dataTransfer.getData("text/plain");
  if (plain.startsWith(WIZARD_CARD_PLAIN_PREFIX)) {
    const cardId = plain.slice(WIZARD_CARD_PLAIN_PREFIX.length).trim();
    if (cardId.length > 0) return cardId;
  }

  return null;
}

/** True when a drag event carries a card the wizard can accept. */
export function dragHasCard(dataTransfer: DataTransfer): boolean {
  if (isCardExternalPointerDragActive()) {
    return true;
  }

  const types = Array.from(dataTransfer.types).map((type) =>
    type.toLowerCase(),
  );

  if (types.includes(WIZARD_CARD_MIME) || types.includes(VAULT_CARD_REF_MIME)) {
    return true;
  }

  // WebView2 / Safari often only expose plain text during dragover. Some
  // environments report it as "Text" (capitalized) or variants.
  return types.some(
    (type) =>
      type === "text" ||
      type === "text/plain" ||
      type.startsWith("text/plain;"),
  );
}

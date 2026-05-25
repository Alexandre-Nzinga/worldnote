import {
  DEFAULT_CARD_IMAGE_FIT,
  DEFAULT_CARD_IMAGE_POSITION,
  type CardImageFit,
  type CardImagePosition,
} from "./schemas/cards/base-card/card-image.js";

export type CardImageDisplay = {
  fit: CardImageFit;
  position: CardImagePosition;
};

/** Images always fill the card frame (cover); position is adjustable by drag. */
export function normalizeCardImageDisplay(
  _fit?: CardImageFit,
  position?: CardImagePosition,
): CardImageDisplay {
  return {
    fit: "fill",
    position: {
      x: position?.x ?? DEFAULT_CARD_IMAGE_POSITION.x,
      y: position?.y ?? DEFAULT_CARD_IMAGE_POSITION.y,
    },
  };
}

export function cardImageObjectStyles(
  fit: CardImageFit,
  position: CardImagePosition,
): { objectFit: "contain" | "cover"; objectPosition: string } {
  const objectPosition = `${position.x}% ${position.y}%`;
  if (fit === "fit") {
    return { objectFit: "contain", objectPosition };
  }
  return { objectFit: "cover", objectPosition };
}

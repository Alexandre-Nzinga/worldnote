import {
  DEFAULT_CARD_IMAGE_FIT,
  DEFAULT_CARD_IMAGE_POSITION,
  DEFAULT_CARD_IMAGE_ZOOM,
  MAX_CARD_IMAGE_ZOOM,
  MIN_CARD_IMAGE_ZOOM,
} from "./schemas/cards/base-card/card-image.js";
import type {
  CardImageFit,
  CardImagePosition,
  CardImageRotation,
} from "./schemas/cards/base-card/card-image.js";

export {
  DEFAULT_CARD_IMAGE_ZOOM,
  MAX_CARD_IMAGE_ZOOM,
  MIN_CARD_IMAGE_ZOOM,
} from "./schemas/cards/base-card/card-image.js";

export type {
  CardImageFit,
  CardImagePosition,
  CardImageRotation,
} from "./schemas/cards/base-card/card-image.js";

export type CardImageDisplay = {
  fit: CardImageFit;
  position: CardImagePosition;
};

export function normalizeCardImageZoom(zoom?: number): number {
  if (zoom == null || !Number.isFinite(zoom)) {
    return DEFAULT_CARD_IMAGE_ZOOM;
  }
  return Math.min(MAX_CARD_IMAGE_ZOOM, Math.max(MIN_CARD_IMAGE_ZOOM, zoom));
}

/** Images always fill the card frame (cover); position is adjustable by drag. */
export function normalizeCardImageRotation(
  rotation?: number,
): CardImageRotation {
  if (rotation === 90 || rotation === 180 || rotation === 270) {
    return rotation;
  }
  return 0;
}

export function rotateCardImageClockwise(
  position: CardImagePosition,
): CardImagePosition {
  const rotation = normalizeCardImageRotation(position.rotation);
  const next: CardImageRotation =
    rotation === 270 ? 0 : ((rotation + 90) as CardImageRotation);
  return { ...position, rotation: next };
}

export function flipCardImageHorizontal(
  position: CardImagePosition,
): CardImagePosition {
  return { ...position, flipX: !position.flipX };
}

export function flipCardImageVertical(
  position: CardImagePosition,
): CardImagePosition {
  return { ...position, flipY: !position.flipY };
}

/** Restore pan, zoom, rotation, and flips to the default for a newly uploaded image. */
export function resetCardImagePosition(): CardImagePosition {
  return { ...DEFAULT_CARD_IMAGE_POSITION };
}

export function isDefaultCardImagePosition(position: CardImagePosition): boolean {
  const normalized = normalizeCardImageDisplay(undefined, position).position;
  return (
    normalized.x === DEFAULT_CARD_IMAGE_POSITION.x &&
    normalized.y === DEFAULT_CARD_IMAGE_POSITION.y &&
    normalized.zoom === DEFAULT_CARD_IMAGE_ZOOM &&
    normalized.rotation === 0 &&
    !normalized.flipX &&
    !normalized.flipY
  );
}

export function normalizeCardImageDisplay(
  _fit?: CardImageFit,
  position?: CardImagePosition,
): CardImageDisplay {
  return {
    fit: "fill",
    position: {
      x: position?.x ?? DEFAULT_CARD_IMAGE_POSITION.x,
      y: position?.y ?? DEFAULT_CARD_IMAGE_POSITION.y,
      zoom: normalizeCardImageZoom(position?.zoom),
      rotation: normalizeCardImageRotation(position?.rotation),
      flipX: position?.flipX ?? false,
      flipY: position?.flipY ?? false,
    },
  };
}

function buildCardImageTransform(position: CardImagePosition): string | undefined {
  const parts: string[] = [];
  const zoomScale =
    normalizeCardImageZoom(position.zoom) / DEFAULT_CARD_IMAGE_ZOOM;
  if (zoomScale !== 1) {
    parts.push(`scale(${zoomScale})`);
  }
  const rotation = normalizeCardImageRotation(position.rotation);
  if (rotation !== 0) {
    parts.push(`rotate(${rotation}deg)`);
  }
  if (position.flipX) {
    parts.push("scaleX(-1)");
  }
  if (position.flipY) {
    parts.push("scaleY(-1)");
  }
  return parts.length > 0 ? parts.join(" ") : undefined;
}

export type CardImageObjectStyles = {
  objectFit: "contain" | "cover";
  objectPosition: string;
  transform?: string;
  transformOrigin?: string;
};

export function cardImageObjectStyles(
  fit: CardImageFit,
  position: CardImagePosition,
): CardImageObjectStyles {
  const objectPosition = `${position.x}% ${position.y}%`;
  const zoom = normalizeCardImageZoom(position.zoom);
  const base: CardImageObjectStyles =
    fit === "fit"
      ? { objectFit: "contain", objectPosition }
      : { objectFit: "cover", objectPosition };

  const transform = buildCardImageTransform(position);
  if (!transform) {
    return base;
  }

  return {
    ...base,
    transform,
    transformOrigin: objectPosition,
  };
}

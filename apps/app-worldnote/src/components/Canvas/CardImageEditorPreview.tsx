import {
  cardImageObjectStyles,
  MAX_CARD_IMAGE_ZOOM,
  MIN_CARD_IMAGE_ZOOM,
  normalizeCardImageZoom,
  type CardImagePosition,
} from "@worldnote/shared";
import { useCallback, useRef } from "react";
import { inspectorImageOverlayLabelClassName } from "./inspector/inspectorFieldStyles.js";

const ZOOM_WHEEL_STEP = 5;
const ZOOM_BUTTON_STEP = 10;

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function adjustZoom(position: CardImagePosition, delta: number): CardImagePosition {
  return {
    ...position,
    zoom: normalizeCardImageZoom((position.zoom ?? 100) + delta),
  };
}

type CardImageEditorPreviewProps = {
  src: string;
  position: CardImagePosition;
  onPositionChange: (position: CardImagePosition) => void;
  /** Full-bleed inspector header — no border or outer radius. */
  embedded?: boolean;
  /** Reposition hint is rendered by the parent when embedded. */
  showRepositionHint?: boolean;
};

export function CardImageEditorPreview({
  src,
  position,
  onPositionChange,
  embedded = false,
  showRepositionHint = true,
}: CardImageEditorPreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const imageStyle = cardImageObjectStyles("fill", position);

  const updatePositionFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const frame = frameRef.current;
      if (!frame) {
        return;
      }
      const rect = frame.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }
      onPositionChange({
        ...position,
        x: clampPercent(((clientX - rect.left) / rect.width) * 100),
        y: clampPercent(((clientY - rect.top) / rect.height) * 100),
      });
    },
    [onPositionChange, position],
  );

  return (
    <div
      ref={frameRef}
      className={
        embedded
          ? "relative h-full touch-none overflow-hidden bg-wn-mono-950"
          : "relative touch-none overflow-hidden rounded-xl border border-wn-mono-700 bg-wn-mono-950"
      }
      onWheel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const delta = event.deltaY < 0 ? ZOOM_WHEEL_STEP : -ZOOM_WHEEL_STEP;
        onPositionChange(adjustZoom(position, delta));
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) {
          return;
        }
        draggingRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        updatePositionFromPointer(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (!draggingRef.current) {
          return;
        }
        updatePositionFromPointer(event.clientX, event.clientY);
      }}
      onPointerUp={(event) => {
        draggingRef.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={(event) => {
        draggingRef.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
    >
      <img
        src={src}
        alt=""
        className="h-full w-full select-none object-cover"
        style={imageStyle}
        draggable={false}
      />
      {showRepositionHint ? (
        <p
          className={`pointer-events-none absolute bottom-3 left-3 ${inspectorImageOverlayLabelClassName}`}
        >
          Drag to reposition · scroll to zoom
        </p>
      ) : null}
    </div>
  );
}

export { MAX_CARD_IMAGE_ZOOM, MIN_CARD_IMAGE_ZOOM, ZOOM_BUTTON_STEP };

export function stepCardImageZoom(
  position: CardImagePosition,
  direction: "in" | "out",
): CardImagePosition {
  const delta = direction === "in" ? ZOOM_BUTTON_STEP : -ZOOM_BUTTON_STEP;
  const next = normalizeCardImageZoom((position.zoom ?? 100) + delta);
  if (direction === "in" && next >= MAX_CARD_IMAGE_ZOOM) {
    return { ...position, zoom: MAX_CARD_IMAGE_ZOOM };
  }
  if (direction === "out" && next <= MIN_CARD_IMAGE_ZOOM) {
    return { ...position, zoom: MIN_CARD_IMAGE_ZOOM };
  }
  return { ...position, zoom: next };
}

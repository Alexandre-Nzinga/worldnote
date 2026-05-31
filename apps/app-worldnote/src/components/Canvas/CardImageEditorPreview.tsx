import {
  cardImageObjectStyles,
  type CardImagePosition,
} from "@worldnote/shared";
import { useCallback, useRef } from "react";
import { inspectorImageOverlayLabelClassName } from "./inspector/inspectorFieldStyles.js";

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
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
  const { objectFit, objectPosition } = cardImageObjectStyles("fill", position);

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
        x: clampPercent(((clientX - rect.left) / rect.width) * 100),
        y: clampPercent(((clientY - rect.top) / rect.height) * 100),
      });
    },
    [onPositionChange],
  );

  return (
    <div
      ref={frameRef}
      className={
        embedded
          ? "relative touch-none overflow-hidden bg-wn-mono-950"
          : "relative touch-none overflow-hidden rounded-xl border border-wn-mono-700 bg-wn-mono-950"
      }
      onPointerDown={(event) => {
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
        className="aspect-video w-full select-none"
        style={{ objectFit, objectPosition }}
        draggable={false}
      />
      {showRepositionHint ? (
        <p
          className={`pointer-events-none absolute bottom-3 left-3 ${inspectorImageOverlayLabelClassName}`}
        >
          Drag to reposition
        </p>
      ) : null}
    </div>
  );
}

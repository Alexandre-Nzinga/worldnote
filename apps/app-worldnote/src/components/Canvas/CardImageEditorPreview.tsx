import {
  cardImageObjectStyles,
  type CardImagePosition,
} from "@worldnote/shared";
import { useCallback, useRef } from "react";

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

type CardImageEditorPreviewProps = {
  src: string;
  position: CardImagePosition;
  onPositionChange: (position: CardImagePosition) => void;
};

export function CardImageEditorPreview({
  src,
  position,
  onPositionChange,
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
      className="relative touch-none overflow-hidden rounded-xl border border-wn-mono-700 bg-wn-mono-950"
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
        className="aspect-5/3 w-full select-none"
        style={{ objectFit, objectPosition }}
        draggable={false}
      />
      <p className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-wn-mono-950/80 px-2 py-0.5 text-[11px] text-wn-mono-400">
        Drag to reposition
      </p>
    </div>
  );
}

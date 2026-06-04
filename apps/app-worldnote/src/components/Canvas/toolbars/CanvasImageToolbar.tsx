import type { CardImagePosition } from "@worldnote/shared";
import { CardImageTransformControls } from "../card-editor/CardImageTransformControls.js";

type CanvasImageToolbarProps = {
  position: CardImagePosition;
  onPositionChange: (position: CardImagePosition) => void;
};

export function CanvasImageToolbar({
  position,
  onPositionChange,
}: CanvasImageToolbarProps) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl border border-wn-mono-600 bg-wn-mono-900 px-3 py-2 shadow-lg"
      role="toolbar"
      aria-label="Image transform"
    >
      <span className="text-xs font-medium text-wn-mono-400">Transform</span>
      <CardImageTransformControls
        position={position}
        onPositionChange={onPositionChange}
        chipClassName="flex h-7 w-7 items-center justify-center rounded-lg border border-wn-mono-600 bg-wn-mono-800 text-wn-mono-200 transition-colors hover:border-wn-mono-500 hover:bg-wn-mono-700 hover:text-wn-mono-50"
      />
    </div>
  );
}

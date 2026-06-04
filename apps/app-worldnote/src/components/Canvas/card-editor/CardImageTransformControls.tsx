import {
  flipCardImageHorizontal,
  flipCardImageVertical,
  isDefaultCardImagePosition,
  resetCardImagePosition,
  rotateCardImageClockwise,
  type CardImagePosition,
} from "@worldnote/shared";
import { MaterialSymbol } from "@worldnote/ui";

type CardImageTransformControlsProps = {
  position: CardImagePosition;
  onPositionChange: (position: CardImagePosition) => void;
  disabled?: boolean;
  className?: string;
  chipClassName?: string;
};

const defaultChipClassName =
  "flex h-8 w-8 items-center justify-center rounded-lg bg-wn-mono-950/80 text-wn-mono-300 transition-colors hover:bg-wn-mono-800 hover:text-wn-mono-50 disabled:opacity-40";

export function CardImageTransformControls({
  position,
  onPositionChange,
  disabled = false,
  className = "flex items-center gap-1",
  chipClassName = defaultChipClassName,
}: CardImageTransformControlsProps) {
  const atDefault = isDefaultCardImagePosition(position);

  return (
    <fieldset className={`${className} m-0 min-w-0 border-0 p-0`}>
      <legend className="sr-only">Image transform</legend>
      <button
        type="button"
        className={chipClassName}
        disabled={disabled}
        aria-label="Flip horizontally"
        title="Flip horizontally"
        onClick={() => onPositionChange(flipCardImageHorizontal(position))}
      >
        <MaterialSymbol name="flip" className="text-lg" />
      </button>
      <button
        type="button"
        className={chipClassName}
        disabled={disabled}
        aria-label="Flip vertically"
        title="Flip vertically"
        onClick={() => onPositionChange(flipCardImageVertical(position))}
      >
        <MaterialSymbol name="swap_vert" className="text-lg" />
      </button>
      <button
        type="button"
        className={chipClassName}
        disabled={disabled}
        aria-label="Rotate 90 degrees"
        title="Rotate 90°"
        onClick={() => onPositionChange(rotateCardImageClockwise(position))}
      >
        <MaterialSymbol name="rotate_90_degrees_cw" className="text-lg" />
      </button>
      <button
        type="button"
        className={chipClassName}
        disabled={disabled || atDefault}
        aria-label="Reset image transforms"
        title="Reset to original framing"
        onClick={() => onPositionChange(resetCardImagePosition())}
      >
        <MaterialSymbol name="restart_alt" className="text-lg" />
      </button>
    </fieldset>
  );
}

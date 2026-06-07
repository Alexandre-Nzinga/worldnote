import type { CardImagePosition } from "@worldnote/shared";
import { MaterialSymbol } from "@worldnote/ui";
import {
  MAX_CARD_IMAGE_ZOOM,
  MIN_CARD_IMAGE_ZOOM,
  stepCardImageZoom,
} from "../card-editor/CardImageEditorPreview.js";
import { CardImageTransformControls } from "../card-editor/CardImageTransformControls.js";
import {
  inspectorImageOverlayChipClassName,
  inspectorImageOverlayLabelClassName,
} from "./inspectorFieldStyles.js";

const iconChipClassName = `${inspectorImageOverlayChipClassName} flex h-7 w-7 shrink-0 items-center justify-center px-0`;

type InspectorImageToolbarProps = {
  imagePath: string;
  imagePosition: CardImagePosition;
  isBusy: boolean;
  onPickImage: () => void;
  onRemoveImage: () => void;
  onPositionChange: (position: CardImagePosition) => void;
  /** Overlay on image (sidebar) or compact strip below image (properties column). */
  layout?: "overlay" | "below";
};

function ImageToolbarControls({
  imagePath,
  imagePosition,
  isBusy,
  onPickImage,
  onRemoveImage,
  onPositionChange,
}: Omit<InspectorImageToolbarProps, "layout">) {
  const zoom = imagePosition.zoom ?? 100;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        className={iconChipClassName}
        disabled={isBusy}
        aria-label="Choose image"
        title="Choose image"
        onClick={onPickImage}
      >
        <MaterialSymbol name="add_photo_alternate" className="text-base" />
      </button>
      {imagePath ? (
        <button
          type="button"
          className={iconChipClassName}
          disabled={isBusy}
          aria-label="Remove image"
          title="Remove image"
          onClick={onRemoveImage}
        >
          <MaterialSymbol name="delete" className="text-base" />
        </button>
      ) : null}

      <span className="mx-0.5 h-5 w-px shrink-0 bg-wn-mono-700" aria-hidden />

      <button
        type="button"
        className={iconChipClassName}
        disabled={isBusy || zoom <= MIN_CARD_IMAGE_ZOOM}
        aria-label="Zoom out"
        title="Zoom out"
        onClick={() =>
          onPositionChange(stepCardImageZoom(imagePosition, "out"))
        }
      >
        −
      </button>
      <span
        className={`${inspectorImageOverlayLabelClassName} min-w-[2.75rem] px-0.5 text-center text-[11px] tabular-nums`}
      >
        {Math.round(zoom)}%
      </span>
      <button
        type="button"
        className={iconChipClassName}
        disabled={isBusy || zoom >= MAX_CARD_IMAGE_ZOOM}
        aria-label="Zoom in"
        title="Zoom in"
        onClick={() => onPositionChange(stepCardImageZoom(imagePosition, "in"))}
      >
        +
      </button>

      <span className="mx-0.5 h-5 w-px shrink-0 bg-wn-mono-700" aria-hidden />

      <CardImageTransformControls
        position={imagePosition}
        onPositionChange={onPositionChange}
        disabled={isBusy}
        chipClassName={iconChipClassName}
      />
    </div>
  );
}

export function InspectorImageToolbar({
  layout = "overlay",
  ...props
}: InspectorImageToolbarProps) {
  if (layout === "below") {
    return (
      <div
        className="shrink-0 rounded-b-lg border-t border-wn-mono-800 bg-wn-mono-950 px-2 py-2"
        aria-label="Image editor controls"
      >
        <ImageToolbarControls {...props} />
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-wn-mono-950/90 via-wn-mono-950/50 to-transparent px-2 pb-2 pt-6 opacity-0 transition-opacity duration-150 group-hover/image:pointer-events-auto group-hover/image:opacity-100 group-focus-within/image:pointer-events-auto group-focus-within/image:opacity-100"
      aria-label="Image editor controls"
    >
      <div className="pointer-events-auto">
        <ImageToolbarControls {...props} />
      </div>
    </div>
  );
}

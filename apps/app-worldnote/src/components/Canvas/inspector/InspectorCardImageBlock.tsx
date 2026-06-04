import {
  cardImageObjectStyles,
  type CardImagePosition,
} from "@worldnote/shared";
import { MaterialSymbol } from "@worldnote/ui";
import { CardImageEditorPreview } from "../card-editor/CardImageEditorPreview.js";
import { InspectorImageToolbar } from "./InspectorImageToolbar.js";

const propertiesImageBlockClassName =
  "group/image flex w-full shrink-0 flex-col overflow-hidden border-b border-wn-mono-800 bg-wn-mono-950";

const propertiesImagePreviewClassName =
  "relative aspect-[4/3] w-full overflow-hidden bg-wn-mono-950";

function InspectorImageReadOnly({
  src,
  position,
}: {
  src: string;
  position: CardImagePosition;
}) {
  const imageStyle = cardImageObjectStyles("fill", position);
  return (
    <img
      src={src}
      alt=""
      className="h-full w-full select-none object-cover"
      style={imageStyle}
      draggable={false}
    />
  );
}

type InspectorCardImageBlockProps = {
  readOnly: boolean;
  imagePreview: string | null;
  imagePath: string;
  imagePosition: CardImagePosition;
  isBusy: boolean;
  onPickImage: () => void;
  onRemoveImage: () => void;
  onPositionChange: (position: CardImagePosition) => void;
};

export function InspectorCardImageBlock({
  readOnly,
  imagePreview,
  imagePath,
  imagePosition,
  isBusy,
  onPickImage,
  onRemoveImage,
  onPositionChange,
}: InspectorCardImageBlockProps) {
  return (
    <div className={propertiesImageBlockClassName}>
      <div className={propertiesImagePreviewClassName}>
        {imagePreview ? (
          readOnly ? (
            <InspectorImageReadOnly
              src={imagePreview}
              position={imagePosition}
            />
          ) : (
            <CardImageEditorPreview
              embedded
              showRepositionHint={false}
              src={imagePreview}
              position={imagePosition}
              onPositionChange={onPositionChange}
            />
          )
        ) : readOnly ? (
          <div className="flex h-full items-center justify-center text-sm text-wn-mono-500">
            No image
          </div>
        ) : (
          <button
            type="button"
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 text-sm text-wn-mono-500 transition-colors hover:bg-wn-mono-900 hover:text-wn-mono-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            aria-label="Choose image"
            onClick={onPickImage}
          >
            <MaterialSymbol name="add_photo_alternate" className="text-2xl" />
            Add image
          </button>
        )}
      </div>

      {!readOnly && imagePreview ? (
        <InspectorImageToolbar
          layout="below"
          imagePath={imagePath}
          imagePosition={imagePosition}
          isBusy={isBusy}
          onPickImage={onPickImage}
          onRemoveImage={onRemoveImage}
          onPositionChange={onPositionChange}
        />
      ) : null}
    </div>
  );
}

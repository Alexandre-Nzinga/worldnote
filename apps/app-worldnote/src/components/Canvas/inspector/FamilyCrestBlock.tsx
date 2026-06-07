import { Button, Eyebrow, MaterialSymbol } from "@worldnote/ui";

import {
  inspectorFieldLabelClassName,
  inspectorSectionClassName,
  inspectorSectionEyebrowClassName,
} from "./inspectorFieldStyles.js";

type FamilyCrestBlockProps = {
  readOnly: boolean;
  crestPreview: string | null;
  isBusy: boolean;
  onPickCrest: () => void;
  onRemoveCrest: () => void;
  /** When true, omit outer padding (used inside Properties tab). */
  embedded?: boolean;
};

export function FamilyCrestBlock({
  readOnly,
  crestPreview,
  isBusy,
  onPickCrest,
  onRemoveCrest,
  embedded = false,
}: FamilyCrestBlockProps) {
  return (
    <section
      className={
        embedded
          ? inspectorSectionClassName
          : "flex flex-col gap-3 border-b border-wn-mono-800 px-5 py-5"
      }
    >
      <Eyebrow as="h3" className={inspectorSectionEyebrowClassName}>
        Family crest
      </Eyebrow>
      <p className="m-0 text-xs leading-snug text-wn-mono-500">
        Upload a family crest to display on the card visual view.
      </p>

      <div className="flex items-start gap-4">
        <div className="flex h-[76px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-md border border-wn-mono-700 bg-wn-mono-900">
          {crestPreview ? (
            <img
              src={crestPreview}
              alt=""
              className="max-h-full max-w-full object-contain p-1"
            />
          ) : (
            <MaterialSymbol
              name="shield"
              className="text-3xl text-wn-mono-600"
              aria-hidden
            />
          )}
        </div>

        {readOnly ? (
          <p className={`m-0 flex-1 ${inspectorFieldLabelClassName}`}>
            {crestPreview ? "Crest uploaded" : "No crest"}
          </p>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="w-fit"
              isDisabled={isBusy}
              onPress={onPickCrest}
            >
              {crestPreview ? "Replace crest" : "Upload crest"}
            </Button>
            {crestPreview ? (
              <Button
                size="sm"
                variant="danger"
                className="w-fit"
                isDisabled={isBusy}
                onPress={onRemoveCrest}
              >
                Remove crest
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

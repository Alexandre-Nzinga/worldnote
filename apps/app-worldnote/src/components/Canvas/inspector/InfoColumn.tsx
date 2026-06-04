import { Input } from "@heroui/react";
import type { Editor } from "@tiptap/core";
import type { WorldCard } from "@worldnote/shared";
import { CardTypePill, visualConfigFor } from "@worldnote/canvas";
import { getHeadingProps, WorldNoteLogo } from "@worldnote/ui";
import type { Ref } from "react";
import {
  InspectorLoreEditor,
  type InspectorLoreEditorHandle,
} from "../../editor/InspectorLoreEditor.js";
import {
  inspectorNameFieldClassNames,
  inspectorSubtitleFieldClassNames,
} from "./inspectorFieldStyles.js";
import { InspectorCardMoreMenu } from "./InspectorCardMoreMenu.js";

type InfoColumnProps = {
  readOnly: boolean;
  cardType: WorldCard["card_type"];
  name: string;
  subtitle: string;
  lore: string;
  logoTone: "white" | "black";
  isMoreMenuDisabled?: boolean;
  loreEditorRef?: Ref<InspectorLoreEditorHandle>;
  onNameChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onLoreChange: (markdown: string) => void;
  onEditorReady?: (editor: Editor | null) => void;
  onViewJson: () => void;
};

export function InfoColumn({
  readOnly,
  cardType,
  name,
  subtitle,
  lore,
  logoTone,
  isMoreMenuDisabled,
  loreEditorRef,
  onNameChange,
  onSubtitleChange,
  onLoreChange,
  onEditorReady,
  onViewJson,
}: InfoColumnProps) {
  const typeVisual = visualConfigFor(cardType);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="shrink-0 px-6 pb-4 pt-6">
        <div className="flex items-start gap-4">
          <WorldNoteLogo
            variant="icon"
            tone={logoTone}
            className="h-10 w-auto shrink-0"
            alt=""
          />
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {readOnly ? (
                <>
                  <h2
                    {...getHeadingProps("h4", {
                      tone: "inverse",
                      weight: "bold",
                      className: "m-0",
                    })}
                  >
                    {name}
                  </h2>
                  {subtitle.trim() ? (
                    <p className="m-0 text-base font-medium leading-snug text-wn-mono-300">
                      {subtitle}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <Input
                    id="inspector-modal-name"
                    aria-label="Name"
                    placeholder="Name"
                    value={name}
                    variant="flat"
                    onValueChange={onNameChange}
                    classNames={inspectorNameFieldClassNames}
                  />
                  <Input
                    id="inspector-modal-subtitle"
                    aria-label="Subtitle"
                    placeholder="Subtitle or alias"
                    value={subtitle}
                    variant="flat"
                    onValueChange={onSubtitleChange}
                    classNames={inspectorSubtitleFieldClassNames}
                  />
                </>
              )}
            </div>
            <CardTypePill
              className={`shrink-0 ${typeVisual.badgeClassName}`}
              textClassName={typeVisual.badgeTextColor}
            >
              {typeVisual.label}
            </CardTypePill>
            <InspectorCardMoreMenu
              disabled={isMoreMenuDisabled}
              onViewJson={onViewJson}
            />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <InspectorLoreEditor
          ref={loreEditorRef}
          value={lore}
          editable={!readOnly}
          fillHeight
          placeholder="Write the lore…"
          onChange={onLoreChange}
          onEditorReady={onEditorReady}
        />
      </div>
    </div>
  );
}

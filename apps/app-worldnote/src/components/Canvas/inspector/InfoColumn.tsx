import { Input } from "@heroui/react";
import type { Editor } from "@tiptap/core";
import type { WorldCard } from "@worldnote/shared";
import { CardTypePill } from "@worldnote/canvas";
import { useSettings } from "../../../hooks/useSettings.js";
import { resolveCardBadgeStyle } from "../../../services/settings/cardTypeBadgeSettings.js";
import { getHeadingProps, WorldNoteLogo } from "@worldnote/ui";
import type { ReactNode, Ref } from "react";
import {
  InspectorLoreEditor,
  type InspectorLoreEditorHandle,
} from "../../editor/InspectorLoreEditor.js";
import {
  inspectorNameFieldClassNames,
  inspectorSubtitleFieldClassNames,
} from "./inspectorFieldStyles.js";
import { InspectorCardMoreMenu } from "./InspectorCardMoreMenu.js";
import { LoreEditorSkeleton } from "./LoreEditorSkeleton.js";
import { LoreEmptyState } from "./LoreEmptyState.js";

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
  wizardSection?: ReactNode;
  isLoreGenerating?: boolean;
  isSubtitleGenerating?: boolean;
  onStartWriting?: () => void;
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
  wizardSection,
  isLoreGenerating = false,
  isSubtitleGenerating = false,
  onStartWriting,
}: InfoColumnProps) {
  const cardTypeBadgeColors = useSettings(
    (state) => state.settings?.cardTypeBadgeColors,
  );
  const typeVisual = resolveCardBadgeStyle(cardType, cardTypeBadgeColors);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="shrink-0 px-6 pb-2 pt-6">
        <div className="flex items-start gap-4">
          <WorldNoteLogo
            variant="icon"
            tone={logoTone}
            className="h-10 w-auto shrink-0"
            alt=""
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                {readOnly ? (
                  <h2
                    {...getHeadingProps("h4", {
                      tone: "inverse",
                      weight: "bold",
                      className: "m-0 break-words",
                    })}
                  >
                    {name}
                  </h2>
                ) : (
                  <Input
                    id="inspector-modal-name"
                    aria-label="Name"
                    placeholder="Name"
                    value={name}
                    variant="flat"
                    onValueChange={onNameChange}
                    classNames={inspectorNameFieldClassNames}
                  />
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
            {isSubtitleGenerating ? (
              <div
                className="h-5 w-2/3 max-w-xs animate-pulse rounded bg-wn-mono-800"
                aria-hidden
              />
            ) : readOnly ? (
              subtitle.trim() ? (
                <p className="m-0 text-base font-medium leading-snug text-wn-mono-300">
                  {subtitle}
                </p>
              ) : null
            ) : (
              <Input
                id="inspector-modal-subtitle"
                aria-label="Subtitle"
                placeholder="Subtitle or alias"
                value={subtitle}
                variant="flat"
                onValueChange={onSubtitleChange}
                classNames={inspectorSubtitleFieldClassNames}
              />
            )}
          </div>
        </div>
      </div>

      {wizardSection}

      <div className="relative flex min-h-0 flex-1 flex-col">
        {isLoreGenerating ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col overflow-hidden bg-wn-mono-900">
            {readOnly ? null : (
              <div className="h-10 shrink-0 border-b border-wn-mono-800 bg-wn-mono-950" />
            )}
            <div className="scrollbar-wn min-h-0 flex-1 overflow-hidden">
              <LoreEditorSkeleton className="px-4 py-3" />
            </div>
          </div>
        ) : null}
        {readOnly && !lore.trim() ? (
          <div className="flex flex-1 items-center justify-center px-6 py-8">
            <LoreEmptyState compact={false} onStartWriting={onStartWriting} />
          </div>
        ) : (
          <InspectorLoreEditor
            ref={loreEditorRef}
            value={lore}
            editable={!readOnly}
            fillHeight
            placeholder="Write the lore…"
            onChange={onLoreChange}
            onEditorReady={onEditorReady}
          />
        )}
      </div>
    </div>
  );
}

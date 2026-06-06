import type { WorldCard } from "@worldnote/shared";
import {
  LoreSimpleEditor,
  type LoreSimpleEditorHandle,
} from "../../editor/LoreSimpleEditor.js";
import type { ReactNode, Ref } from "react";
import { inspectorTabPaddingXClassName } from "./inspectorFieldStyles.js";
import { GroupMembersSection } from "./GroupMembersSection.js";
import { LoreEditorSkeleton } from "./LoreEditorSkeleton.js";
import { LoreEmptyState } from "./LoreEmptyState.js";
import { MarkdownView } from "./MarkdownView.js";

type InfoTabProps = {
  readOnly: boolean;
  lore: string;
  vaultPath: string;
  loreEditorRef?: Ref<LoreSimpleEditorHandle>;
  onLoreChange: (markdown: string) => void;
  onNavigateToCard?: (cardId: string) => void;
  groupMembers?: WorldCard[];
  wizardSection?: ReactNode;
  isLoreGenerating?: boolean;
  onStartWriting?: () => void;
};

export function InfoTab({
  readOnly,
  lore,
  vaultPath,
  loreEditorRef,
  onLoreChange,
  onNavigateToCard,
  groupMembers = [],
  wizardSection,
  isLoreGenerating = false,
  onStartWriting,
}: InfoTabProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {wizardSection}
      <section
        className={[
          "flex min-h-0 flex-1 flex-col",
          wizardSection ? "mt-6" : "",
        ].join(" ")}
      >
        {readOnly ? (
          <div className="scrollbar-wn flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-3">
            {isLoreGenerating ? (
              <LoreEditorSkeleton />
            ) : !lore.trim() ? (
              <div className="flex flex-1 items-center justify-center py-6">
                <LoreEmptyState onStartWriting={onStartWriting} />
              </div>
            ) : (
              <MarkdownView content={lore} />
            )}
          </div>
        ) : (
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            {isLoreGenerating ? (
              <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden bg-wn-mono-900">
                <LoreEditorSkeleton className="px-4 py-3" />
              </div>
            ) : null}
            <LoreSimpleEditor
              ref={loreEditorRef}
              value={lore}
              editable
              flushWidth
              fillHeight
              placeholder="Write the lore…"
              onChange={onLoreChange}
            />
          </div>
        )}
      </section>

      {groupMembers.length > 0 ? (
        <div
          className={`border-t border-wn-border ${inspectorTabPaddingXClassName}`}
        >
          <GroupMembersSection
            members={groupMembers}
            vaultPath={vaultPath}
            onNavigateToCard={onNavigateToCard}
          />
        </div>
      ) : null}
    </div>
  );
}

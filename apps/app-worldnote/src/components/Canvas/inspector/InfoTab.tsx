import type { WorldCard } from "@worldnote/shared";
import {
  LoreSimpleEditor,
  type LoreSimpleEditorHandle,
} from "../../editor/LoreSimpleEditor.js";
import type { Ref } from "react";
import { inspectorTabPaddingXClassName } from "./inspectorFieldStyles.js";
import { GroupMembersSection } from "./GroupMembersSection.js";
import { MarkdownView } from "./MarkdownView.js";

type InfoTabProps = {
  readOnly: boolean;
  lore: string;
  vaultPath: string;
  loreEditorRef?: Ref<LoreSimpleEditorHandle>;
  onLoreChange: (markdown: string) => void;
  onNavigateToCard?: (cardId: string) => void;
  groupMembers?: WorldCard[];
};

export function InfoTab({
  readOnly,
  lore,
  vaultPath,
  loreEditorRef,
  onLoreChange,
  onNavigateToCard,
  groupMembers = [],
}: InfoTabProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-8">
      <section className="flex min-h-0 flex-1 flex-col">
        {readOnly ? (
          <div className="scrollbar-wn min-h-0 flex-1 overflow-y-auto px-5 py-3">
            <MarkdownView content={lore} emptyMessage="No lore yet." />
          </div>
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
        <div className={inspectorTabPaddingXClassName}>
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

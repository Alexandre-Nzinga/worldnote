import type { WorldCard } from "@worldnote/shared";
import {
  LoreSimpleEditor,
  type LoreSimpleEditorHandle,
} from "../../editor/LoreSimpleEditor.js";
import type { Ref } from "react";
import { inspectorSectionLabelClassName } from "./inspectorFieldStyles.js";
import { GroupMembersSection } from "./GroupMembersSection.js";
import { MarkdownView } from "./MarkdownView.js";
import { TagsSection } from "./TagsSection.js";

type InfoTabProps = {
  readOnly: boolean;
  tags: string[];
  tagsInput: string;
  onTagsInputChange: (value: string) => void;
  lore: string;
  vaultPath: string;
  loreEditorRef?: Ref<LoreSimpleEditorHandle>;
  onLoreChange: (markdown: string) => void;
  onNavigateToCard?: (cardId: string) => void;
  groupMembers?: WorldCard[];
};

export function InfoTab({
  readOnly,
  tags,
  tagsInput,
  onTagsInputChange,
  lore,
  vaultPath,
  loreEditorRef,
  onLoreChange,
  onNavigateToCard,
  groupMembers = [],
}: InfoTabProps) {
  return (
    <div
      className={
        readOnly
          ? "flex min-h-full flex-1 flex-col gap-8"
          : "flex flex-col gap-8"
      }
    >
      <section
        className={
          readOnly
            ? "flex min-h-0 flex-1 flex-col gap-3"
            : "flex flex-col gap-3"
        }
      >
        <span className={inspectorSectionLabelClassName}>Lore</span>
        {readOnly ? (
          <div className="min-h-0 flex-1">
            <MarkdownView content={lore} emptyMessage="No lore yet." />
          </div>
        ) : (
          <LoreSimpleEditor
            ref={loreEditorRef}
            value={lore}
            editable
            placeholder="Write the lore…"
            onChange={onLoreChange}
          />
        )}
      </section>

      {groupMembers.length > 0 ? (
        <GroupMembersSection
          members={groupMembers}
          vaultPath={vaultPath}
          onNavigateToCard={onNavigateToCard}
        />
      ) : null}

      <TagsSection
        readOnly={readOnly}
        tags={tags}
        tagsInput={tagsInput}
        onTagsInputChange={onTagsInputChange}
      />
    </div>
  );
}

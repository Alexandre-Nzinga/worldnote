import { Input } from "@heroui/react";
import type { WorldCard } from "@worldnote/shared";
import { Pill, type PillTone } from "@worldnote/ui";
import { useMemo, type Ref } from "react";
import { LoreEditor, type LoreEditorHandle } from "./loreEditor/LoreEditor.js";
import type { LoreDoc } from "./loreEditor/loreDocTypes.js";
import { resolveInitialLoreDoc } from "./loreEditor/seedLoreDoc.js";
import {
  inspectorInlineInputClassNames,
  inspectorSectionLabelClassName,
} from "./inspectorFieldStyles.js";

const TAG_TONES: PillTone[] = [
  "azure",
  "indigo",
  "amber",
  "lime",
  "rose",
  "mono",
];

type InfoTabProps = {
  readOnly: boolean;
  tags: string[];
  tagsInput: string;
  onTagsInputChange: (value: string) => void;
  lore: string;
  loreDoc?: Record<string, unknown>;
  legacyDescription?: string;
  vaultPath: string;
  cardId: string;
  cardsById: Record<string, WorldCard>;
  onDescriptionChange: (plainText: string, doc: LoreDoc) => void;
  onNavigateToCard?: (cardId: string) => void;
  loreEditorRef?: Ref<LoreEditorHandle>;
};

export function InfoTab({
  readOnly,
  tags,
  tagsInput,
  onTagsInputChange,
  lore,
  loreDoc,
  legacyDescription,
  vaultPath,
  cardId,
  cardsById,
  onDescriptionChange,
  onNavigateToCard,
  loreEditorRef,
}: InfoTabProps) {
  const initialDoc = useMemo(
    () => resolveInitialLoreDoc(loreDoc, lore, legacyDescription),
    [loreDoc, lore, legacyDescription],
  );

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        <LoreEditor
          ref={loreEditorRef}
          readOnly={readOnly}
          initialDoc={initialDoc}
          vaultPath={vaultPath}
          cardId={cardId}
          cardsById={cardsById}
          onChange={(doc, plainText) => onDescriptionChange(plainText, doc)}
          onNavigateToCard={onNavigateToCard}
        />
      </section>

      <section className="flex flex-col gap-2">
        <span className={inspectorSectionLabelClassName}>Tags</span>
        {readOnly ? (
          tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Pill
                  key={tag}
                  tone={TAG_TONES[index % TAG_TONES.length]}
                  size="sm"
                >
                  {tag}
                </Pill>
              ))}
            </div>
          ) : (
            <p className="text-sm text-wn-mono-500">No tags yet.</p>
          )
        ) : (
          <>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Pill
                    key={tag}
                    tone={TAG_TONES[index % TAG_TONES.length]}
                    size="sm"
                  >
                    {tag}
                  </Pill>
                ))}
              </div>
            ) : null}
            <Input
              id="inspector-tags"
              placeholder="hero, faction"
              value={tagsInput}
              onValueChange={onTagsInputChange}
              variant="flat"
              classNames={inspectorInlineInputClassNames}
            />
          </>
        )}
      </section>
    </div>
  );
}

import type {
  CardImagePosition,
  SocketDescriptor,
  WorldCard,
} from "@worldnote/shared";
import type { TypeSpecificEditorState } from "../cardEditorTypes.js";
import { GroupMembersSection } from "./GroupMembersSection.js";
import { InspectorCardImageBlock } from "./InspectorCardImageBlock.js";
import { PropertiesTab } from "./PropertiesTab.js";
import { InspectorDeleteButton } from "./InspectorDeleteButton.js";
import { TagsSection } from "./TagsSection.js";

type PropertyRow = { key: string; value: string };

type PropertiesColumnProps = {
  readOnly: boolean;
  card: WorldCard;
  vaultPath: string;
  imagePreview: string | null;
  imagePath: string;
  imagePosition: CardImagePosition;
  isBusy: boolean;
  tags: string[];
  tagsInput: string;
  onTagsInputChange: (value: string) => void;
  typeFields: TypeSpecificEditorState;
  onTypeFieldsChange: (next: TypeSpecificEditorState) => void;
  socketEntries: Array<{ id: string; descriptor: SocketDescriptor }>;
  socketLinkLabels: Record<string, string[]>;
  formatSocketId: (id: string) => string;
  formatSocketLinkValue: (names: string[] | undefined) => string;
  propertyRows: PropertyRow[];
  onPropertyRowsChange: (rows: PropertyRow[]) => void;
  onPickImage: () => void;
  onRemoveImage: () => void;
  onPositionChange: (position: CardImagePosition) => void;
  groupMembers: WorldCard[];
  onNavigateToCard?: (cardId: string) => void;
  isDeleting?: boolean;
  onDelete?: () => void;
};

export function PropertiesColumn({
  readOnly,
  card,
  vaultPath,
  imagePreview,
  imagePath,
  imagePosition,
  isBusy,
  tags,
  tagsInput,
  onTagsInputChange,
  typeFields,
  onTypeFieldsChange,
  socketEntries,
  socketLinkLabels,
  formatSocketId,
  formatSocketLinkValue,
  propertyRows,
  onPropertyRowsChange,
  onPickImage,
  onRemoveImage,
  onPositionChange,
  groupMembers,
  onNavigateToCard,
  isDeleting,
  onDelete,
}: PropertiesColumnProps) {
  return (
    <aside
      className="scrollbar-wn flex min-h-0 flex-1 flex-col overflow-y-auto"
      aria-label="Card properties"
    >
      <InspectorCardImageBlock
        readOnly={readOnly}
        imagePreview={imagePreview}
        imagePath={imagePath}
        imagePosition={imagePosition}
        isBusy={isBusy}
        onPickImage={onPickImage}
        onRemoveImage={onRemoveImage}
        onPositionChange={onPositionChange}
      />

      <div className="flex flex-col gap-6 px-5 py-5">
      <PropertiesTab
        readOnly={readOnly}
        cardType={card.card_type}
        typeFields={typeFields}
        onTypeFieldsChange={onTypeFieldsChange}
        socketEntries={socketEntries}
        socketLinkLabels={socketLinkLabels}
        formatSocketId={formatSocketId}
        formatSocketLinkValue={formatSocketLinkValue}
        propertyRows={propertyRows}
        onPropertyRowsChange={onPropertyRowsChange}
        isBusy={isBusy}
      />

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

      {!readOnly && onDelete ? (
        <InspectorDeleteButton
          isBusy={isBusy}
          isDeleting={isDeleting}
          onDelete={onDelete}
        />
      ) : null}
      </div>
    </aside>
  );
}

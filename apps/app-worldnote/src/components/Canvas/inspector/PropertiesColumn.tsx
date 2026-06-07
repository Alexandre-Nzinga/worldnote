import type {
  CardImagePosition,
  Link,
  SocketDescriptor,
  WorldCard,
} from "@worldnote/shared";
import type { TypeSpecificEditorState } from "../card-editor/cardEditorTypes.js";
import { GroupMembersSection } from "./GroupMembersSection.js";
import { FamilyCrestBlock } from "./FamilyCrestBlock.js";
import { InspectorCardImageBlock } from "./InspectorCardImageBlock.js";
import { PropertiesTab } from "./PropertiesTab.js";
import { InspectorDeleteButton } from "./InspectorDeleteButton.js";

type PropertyRow = { key: string; value: string };

type PropertiesColumnProps = {
  readOnly: boolean;
  card: WorldCard;
  cardsById: Record<string, WorldCard>;
  vaultPath: string;
  imagePreview: string | null;
  imagePath: string;
  imagePosition: CardImagePosition;
  isBusy: boolean;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
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
  crestPreview: string | null;
  crestPath: string;
  onPickCrest: () => void;
  onRemoveCrest: () => void;
  groupMembers: WorldCard[];
  onNavigateToCard?: (cardId: string) => void;
  isDeleting?: boolean;
  onDelete?: () => void;
  links: Link[];
  onCreateSocketLink?: (socketId: string, targetCardId: string) => void;
  onRemoveSocketLink?: (linkId: string) => void;
  onCreateAndLinkCard?: (
    socketId: string,
    cardType: WorldCard["card_type"],
    name: string,
  ) => void;
};

export function PropertiesColumn({
  readOnly,
  card,
  cardsById,
  vaultPath,
  imagePreview,
  imagePath,
  imagePosition,
  isBusy,
  tags,
  onTagsChange,
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
  crestPreview,
  onPickCrest,
  onRemoveCrest,
  groupMembers,
  onNavigateToCard,
  isDeleting,
  onDelete,
  links,
  onCreateSocketLink,
  onRemoveSocketLink,
  onCreateAndLinkCard,
}: PropertiesColumnProps) {
  return (
    <aside
      className="scrollbar-wn flex min-h-0 flex-1 flex-col overflow-y-auto bg-wn-mono-950"
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

      {card.card_type === "family" ? (
        <FamilyCrestBlock
          readOnly={readOnly}
          crestPreview={crestPreview}
          isBusy={isBusy}
          onPickCrest={onPickCrest}
          onRemoveCrest={onRemoveCrest}
        />
      ) : null}

      <div className="flex flex-col gap-5 py-4">
        <PropertiesTab
          readOnly={readOnly}
          tags={tags}
          onTagsChange={onTagsChange}
          card={card}
          cardsById={cardsById}
          links={links}
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
          onCreateSocketLink={onCreateSocketLink}
          onRemoveSocketLink={onRemoveSocketLink}
          onCreateAndLinkCard={onCreateAndLinkCard}
        />

        {groupMembers.length > 0 ? (
          <GroupMembersSection
            members={groupMembers}
            vaultPath={vaultPath}
            onNavigateToCard={onNavigateToCard}
          />
        ) : null}

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

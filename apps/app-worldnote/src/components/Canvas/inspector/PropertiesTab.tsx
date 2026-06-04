import { Input } from "@heroui/react";
import { MaterialSymbol } from "@worldnote/ui";
import type { Link, SocketDescriptor, WorldCard } from "@worldnote/shared";
import { CardTypeFields } from "../CardTypeFields.js";
import type { TypeSpecificEditorState } from "../cardEditorTypes.js";
import {
  inspectorFieldLabelClassName,
  inspectorFieldValueClassName,
  inspectorInlineInputClassNames,
  inspectorConnectionsSectionLabelClassName,
  inspectorSectionLabelClassName,
  inspectorTabPaddingXClassName,
} from "./inspectorFieldStyles.js";
import { FamilyCrestBlock } from "./FamilyCrestBlock.js";
import { SocketConnectionsEditor } from "./SocketConnectionsEditor.js";
import { TagsSection } from "./TagsSection.js";

type PropertyRow = { key: string; value: string };

type PropertiesTabProps = {
  readOnly: boolean;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  card: WorldCard;
  cardsById: Record<string, WorldCard>;
  links: Link[];
  cardType: WorldCard["card_type"];
  typeFields: TypeSpecificEditorState;
  onTypeFieldsChange: (next: TypeSpecificEditorState) => void;
  socketEntries: Array<{ id: string; descriptor: SocketDescriptor }>;
  socketLinkLabels: Record<string, string[]>;
  formatSocketId: (id: string) => string;
  formatSocketLinkValue: (names: string[] | undefined) => string;
  propertyRows: PropertyRow[];
  onPropertyRowsChange: (rows: PropertyRow[]) => void;
  isBusy: boolean;
  onCreateSocketLink?: (socketId: string, targetCardId: string) => void;
  onRemoveSocketLink?: (linkId: string) => void;
  onCreateAndLinkCard?: (
    socketId: string,
    cardType: WorldCard["card_type"],
    name: string,
  ) => void;
  crestPreview?: string | null;
  onPickCrest?: () => void;
  onRemoveCrest?: () => void;
};

function PropertyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={inspectorFieldLabelClassName}>{label}</span>
      <p className={inspectorFieldValueClassName}>{value.trim() || "—"}</p>
    </div>
  );
}

export function PropertiesTab({
  readOnly,
  tags,
  onTagsChange,
  card,
  cardsById,
  links,
  cardType,
  typeFields,
  onTypeFieldsChange,
  socketEntries,
  socketLinkLabels,
  formatSocketId,
  formatSocketLinkValue,
  propertyRows,
  onPropertyRowsChange,
  isBusy,
  onCreateSocketLink,
  onRemoveSocketLink,
  onCreateAndLinkCard,
  crestPreview = null,
  onPickCrest,
  onRemoveCrest,
}: PropertiesTabProps) {
  const hasSockets = socketEntries.length > 0;
  const hasCustomProperties = propertyRows.length > 0;
  const canEditConnections =
    !readOnly &&
    onCreateSocketLink != null &&
    onRemoveSocketLink != null &&
    onCreateAndLinkCard != null;

  const customPropertiesContent = readOnly ? (
    hasCustomProperties ? (
      <div className="flex flex-col gap-3">
        {propertyRows.map((row, index) => (
          <PropertyField
            key={`${row.key}-${index}`}
            label={row.key}
            value={row.value}
          />
        ))}
      </div>
    ) : (
      <p className="text-sm text-wn-mono-500">No additional properties yet.</p>
    )
  ) : hasCustomProperties ? (
    propertyRows.map((row, index) => (
      <div key={`${row.key}-${index}`} className="flex flex-col gap-1">
        <div className="flex items-start gap-2">
          <Input
            aria-label="Property name"
            placeholder="Key"
            value={row.key}
            variant="flat"
            onValueChange={(next) =>
              onPropertyRowsChange(
                propertyRows.map((entry, rowIndex) =>
                  rowIndex === index ? { ...entry, key: next } : entry,
                ),
              )
            }
            classNames={{
              ...inspectorInlineInputClassNames,
              base: "flex-1",
              input:
                "!text-xs font-medium !text-wn-mono-500 placeholder:!text-wn-mono-600",
            }}
          />
          <button
            type="button"
            className="shrink-0 rounded-lg px-2 py-1 text-wn-mono-500 hover:bg-wn-mono-800 hover:text-wn-red-400"
            aria-label="Remove property"
            disabled={isBusy}
            onClick={() =>
              onPropertyRowsChange(
                propertyRows.filter((_, rowIndex) => rowIndex !== index),
              )
            }
          >
            <MaterialSymbol name="delete" className="text-base" />
          </button>
        </div>
        <Input
          aria-label="Property value"
          placeholder="Value"
          value={row.value}
          variant="flat"
          onValueChange={(next) =>
            onPropertyRowsChange(
              propertyRows.map((entry, rowIndex) =>
                rowIndex === index ? { ...entry, value: next } : entry,
              ),
            )
          }
          classNames={inspectorInlineInputClassNames}
        />
      </div>
    ))
  ) : (
    <p className="text-sm text-wn-mono-500">No additional properties yet.</p>
  );

  return (
    <div className={`flex flex-col gap-6 ${inspectorTabPaddingXClassName}`}>
      {cardType === "family" && onPickCrest && onRemoveCrest ? (
        <FamilyCrestBlock
          embedded
          readOnly={readOnly}
          crestPreview={crestPreview}
          isBusy={isBusy}
          onPickCrest={onPickCrest}
          onRemoveCrest={onRemoveCrest}
        />
      ) : null}
      <TagsSection
        readOnly={readOnly}
        tags={tags}
        onTagsChange={onTagsChange}
      />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className={inspectorSectionLabelClassName}>Properties</span>
          {!readOnly ? (
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-wn-mono-500 transition-colors hover:bg-wn-mono-800 hover:text-wn-mono-50 disabled:opacity-40"
              aria-label="Add property"
              disabled={isBusy}
              onClick={() =>
                onPropertyRowsChange([...propertyRows, { key: "", value: "" }])
              }
            >
              <MaterialSymbol name="add" className="text-[20px]" />
            </button>
          ) : null}
        </div>
        <div className="flex flex-col gap-3">
          <CardTypeFields
            cardType={cardType}
            fields={typeFields}
            onChange={onTypeFieldsChange}
            disabled={isBusy}
            readOnly={readOnly}
          />
          {customPropertiesContent}
        </div>
      </section>

      {hasSockets ? (
        canEditConnections ? (
          <SocketConnectionsEditor
            card={card}
            cardsById={cardsById}
            links={links}
            socketEntries={socketEntries}
            formatSocketId={formatSocketId}
            disabled={isBusy}
            onCreateSocketLink={onCreateSocketLink}
            onRemoveSocketLink={onRemoveSocketLink}
            onCreateAndLinkCard={onCreateAndLinkCard}
          />
        ) : (
          <section className="flex flex-col gap-3">
            <span className={inspectorConnectionsSectionLabelClassName}>
              Connections
            </span>
            <div className="flex flex-col gap-3">
              {socketEntries.map(({ id }) => (
                <PropertyField
                  key={id}
                  label={formatSocketId(id)}
                  value={formatSocketLinkValue(socketLinkLabels[id])}
                />
              ))}
            </div>
          </section>
        )
      ) : null}
    </div>
  );
}

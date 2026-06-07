import { Input } from "@heroui/react";
import { Eyebrow, MaterialSymbol } from "@worldnote/ui";
import {
  detectMeasurementKind,
  formatMeasurementPropertyValue,
  measurementEditorValue,
  measurementFieldLabel,
  measurementInputPlaceholder,
  measurementStoredValue,
  type Link,
  type SocketDescriptor,
  type WorldCard,
} from "@worldnote/shared";
import { useMemo } from "react";
import { useSettings } from "../../../hooks/useSettings.js";
import {
  buildFamilyGraph,
  parentConflictsForCard,
} from "../../../services/familyTree/buildFamilyGraph.js";
import { normalizeUnitSystem } from "../../../services/settings/unitSystem.js";
import { CardTypeFields } from "../card-editor/CardTypeFields.js";
import type { TypeSpecificEditorState } from "../card-editor/cardEditorTypes.js";
import {
  inspectorFieldLabelClassName,
  inspectorFieldValueClassName,
  inspectorInlineInputClassNames,
  inspectorHeaderIconActionClassName,
  inspectorSectionClassName,
  inspectorSectionEyebrowClassName,
  inspectorSectionStackClassName,
  inspectorTabPaddingXClassName,
} from "./inspectorFieldStyles.js";
import { FamilyCrestBlock } from "./FamilyCrestBlock.js";
import { ParentConflictWarning } from "./ParentConflictWarning.js";
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

function propertyLabel(key: string, unitSystem: ReturnType<typeof normalizeUnitSystem>) {
  const kind = detectMeasurementKind(key);
  if (!kind) {
    return key;
  }
  return measurementFieldLabel(kind, unitSystem);
}

function propertyDisplayValue(
  key: string,
  value: string,
  unitSystem: ReturnType<typeof normalizeUnitSystem>,
) {
  return formatMeasurementPropertyValue(key, value, unitSystem);
}

function propertyEditorValue(
  key: string,
  value: string,
  unitSystem: ReturnType<typeof normalizeUnitSystem>,
) {
  const kind = detectMeasurementKind(key);
  if (!kind) {
    return value;
  }
  return measurementEditorValue(value, kind, unitSystem);
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
  const unitSystem = normalizeUnitSystem(
    useSettings((state) => state.settings?.unitSystem),
  );
  const hasSockets = socketEntries.length > 0;
  const hasCustomProperties = propertyRows.length > 0;
  const canEditConnections =
    !readOnly &&
    onCreateSocketLink != null &&
    onRemoveSocketLink != null &&
    onCreateAndLinkCard != null;

  const parentConflicts = useMemo(() => {
    if (card.card_type !== "character") {
      return [];
    }
    const characters = Object.values(cardsById).filter(
      (entry) => entry.card_type === "character",
    );
    const graph = buildFamilyGraph(characters, links);
    return parentConflictsForCard(graph.parentConflicts, card.id);
  }, [card.card_type, card.id, cardsById, links]);

  const customPropertiesContent = readOnly ? (
    hasCustomProperties ? (
      <div className="flex flex-col gap-3">
        {propertyRows.map((row, index) => (
          <PropertyField
            key={`${row.key}-${index}`}
            label={propertyLabel(row.key, unitSystem)}
            value={propertyDisplayValue(row.key, row.value, unitSystem)}
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
            aria-label="Property title"
            placeholder="Property title"
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
          aria-label="Property"
          placeholder={
            detectMeasurementKind(row.key)
              ? measurementInputPlaceholder(
                  detectMeasurementKind(row.key) ?? "weight",
                  unitSystem,
                )
              : "Property"
          }
          value={propertyEditorValue(row.key, row.value, unitSystem)}
          variant="flat"
          onValueChange={(next) => {
            const kind = detectMeasurementKind(row.key);
            const storedValue =
              kind !== null
                ? measurementStoredValue(next, kind, unitSystem)
                : next;
            onPropertyRowsChange(
              propertyRows.map((entry, rowIndex) =>
                rowIndex === index ? { ...entry, value: storedValue } : entry,
              ),
            );
          }}
          classNames={inspectorInlineInputClassNames}
        />
      </div>
    ))
  ) : (
    <p className="text-sm text-wn-mono-500">No additional properties yet.</p>
  );

  return (
    <div
      className={`${inspectorSectionStackClassName} ${inspectorTabPaddingXClassName} pt-5`}
    >
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

      <section className={inspectorSectionClassName}>
        <div className="flex items-center justify-between gap-2">
          <Eyebrow
            as="h3"
            showDot={false}
            className={inspectorSectionEyebrowClassName}
          >
            Properties
          </Eyebrow>
          {!readOnly ? (
            <button
              type="button"
              className={inspectorHeaderIconActionClassName}
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
            parentConflicts={parentConflicts}
            onCreateSocketLink={onCreateSocketLink}
            onRemoveSocketLink={onRemoveSocketLink}
            onCreateAndLinkCard={onCreateAndLinkCard}
          />
        ) : (
          <section className={inspectorSectionClassName}>
            <Eyebrow
              as="h3"
              showDot={false}
              className={inspectorSectionEyebrowClassName}
            >
              Connections
            </Eyebrow>
            <div className="flex flex-col gap-3">
              <ParentConflictWarning
                conflicts={parentConflicts}
                cardsById={cardsById}
              />
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

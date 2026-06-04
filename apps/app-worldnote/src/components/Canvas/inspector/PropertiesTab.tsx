import { Input } from "@heroui/react";
import { Button, MaterialSymbol } from "@worldnote/ui";
import type { SocketDescriptor, WorldCard } from "@worldnote/shared";
import { CardTypeFields } from "../CardTypeFields.js";
import type { TypeSpecificEditorState } from "../cardEditorTypes.js";
import {
  inspectorFieldLabelClassName,
  inspectorFieldValueClassName,
  inspectorInlineInputClassNames,
  inspectorSectionLabelClassName,
} from "./inspectorFieldStyles.js";

type PropertyRow = { key: string; value: string };

type PropertiesTabProps = {
  readOnly: boolean;
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
}: PropertiesTabProps) {
  const hasSockets = socketEntries.length > 0;
  const hasCustomProperties = propertyRows.length > 0;

  return (
    <div className="flex flex-col gap-8">
      {hasSockets ? (
        <section className="flex flex-col gap-4">
          <span className={inspectorSectionLabelClassName}>Connections</span>
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
      ) : null}

      <section className="flex flex-col gap-4">
        <span className={inspectorSectionLabelClassName}>Type fields</span>
        <div className="flex flex-col gap-3">
          <CardTypeFields
            cardType={cardType}
            fields={typeFields}
            onChange={onTypeFieldsChange}
            disabled={isBusy}
            readOnly={readOnly}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={inspectorSectionLabelClassName}>
            Custom properties
          </span>
          {!readOnly ? (
            <Button
              variant="ghost"
              size="sm"
              isDisabled={isBusy}
              onPress={() =>
                onPropertyRowsChange([...propertyRows, { key: "", value: "" }])
              }
            >
              Add
            </Button>
          ) : null}
        </div>
        {readOnly ? (
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
            <p className="text-sm text-wn-mono-500">No custom properties yet.</p>
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
          <p className="text-sm text-wn-mono-500">No custom properties yet.</p>
        )}
      </section>
    </div>
  );
}

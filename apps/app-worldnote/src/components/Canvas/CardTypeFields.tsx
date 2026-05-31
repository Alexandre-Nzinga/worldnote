import type { WorldCard } from "@worldnote/shared";
import { EnumComboBox } from "@worldnote/ui";
import { Input } from "@heroui/react";
import {
  inspectorFieldLabelClassName,
  inspectorFieldValueClassName,
  inspectorInlineInputClassNames,
} from "./inspector/inspectorFieldStyles.js";
import type { TypeSpecificEditorState } from "./cardEditorTypes.js";

const itemRarityOptions = [
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
  { value: "epic", label: "Epic" },
  { value: "legendary", label: "Legendary" },
  { value: "artifact", label: "Artifact" },
] as const;

const vehicleSubTypeOptions = [
  { value: "car", label: "Car" },
  { value: "ship", label: "Ship" },
  { value: "spaceship", label: "Spaceship" },
  { value: "mount", label: "Mount" },
  { value: "bike", label: "Bike" },
  { value: "other", label: "Other" },
] as const;

const floraToxicityOptions = [
  { value: "harmless", label: "Harmless" },
  { value: "medicinal", label: "Medicinal" },
  { value: "toxic", label: "Toxic" },
  { value: "lethal", label: "Lethal" },
] as const;

const faunaDietOptions = [
  { value: "carnivore", label: "Carnivore" },
  { value: "herbivore", label: "Herbivore" },
  { value: "omnivore", label: "Omnivore" },
  { value: "detritivore", label: "Detritivore" },
] as const;

const structureConditionOptions = [
  { value: "intact", label: "Intact" },
  { value: "damaged", label: "Damaged" },
  { value: "ruined", label: "Ruined" },
  { value: "under_construction", label: "Under construction" },
] as const;

function labelForOption(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={inspectorFieldLabelClassName}>{label}</span>
      <p className={inspectorFieldValueClassName}>{value.trim() || "—"}</p>
    </div>
  );
}

type CardTypeFieldsProps = {
  cardType: WorldCard["card_type"];
  fields: TypeSpecificEditorState;
  onChange: (next: TypeSpecificEditorState) => void;
  disabled?: boolean;
  readOnly?: boolean;
};

export function CardTypeFields({
  cardType,
  fields,
  onChange,
  disabled = false,
  readOnly = false,
}: CardTypeFieldsProps) {
  const patch = (partial: Partial<TypeSpecificEditorState>) =>
    onChange({ ...fields, ...partial });

  switch (cardType) {
    case "character":
      if (readOnly) {
        return <ReadOnlyField label="Birthdate" value={fields.birthdate} />;
      }
      return (
        <div className="flex flex-col gap-1">
          <label htmlFor="card-birthdate" className={inspectorFieldLabelClassName}>
            Birthdate
          </label>
          <Input
            id="card-birthdate"
            placeholder="Year 402"
            value={fields.birthdate}
            isDisabled={disabled}
            onValueChange={(birthdate) => patch({ birthdate })}
            classNames={inspectorInlineInputClassNames}
          />
        </div>
      );
    case "location":
      if (readOnly) {
        return <ReadOnlyField label="Coordinates" value={fields.coordinates} />;
      }
      return (
        <div className="flex flex-col gap-1">
          <label htmlFor="card-coordinates" className={inspectorFieldLabelClassName}>
            Coordinates
          </label>
          <Input
            id="card-coordinates"
            placeholder="12.4, -3.1"
            value={fields.coordinates}
            isDisabled={disabled}
            onValueChange={(coordinates) => patch({ coordinates })}
            classNames={inspectorInlineInputClassNames}
          />
        </div>
      );
    case "item":
      if (readOnly) {
        return (
          <>
            <ReadOnlyField label="Weight" value={fields.itemWeight} />
            <ReadOnlyField
              label="Rarity"
              value={
                fields.itemRarity
                  ? labelForOption(itemRarityOptions, fields.itemRarity)
                  : ""
              }
            />
          </>
        );
      }
      return (
        <>
          <div className="flex flex-col gap-1">
            <label htmlFor="card-weight" className={inspectorFieldLabelClassName}>
              Weight
            </label>
            <Input
              id="card-weight"
              type="number"
              value={fields.itemWeight}
              isDisabled={disabled}
              onValueChange={(itemWeight) => patch({ itemWeight })}
              classNames={inspectorInlineInputClassNames}
            />
          </div>
          <EnumComboBox
            id="card-rarity"
            label="Rarity"
            value={fields.itemRarity ?? ""}
            options={[...itemRarityOptions]}
            allowEmpty
            disabled={disabled}
            onChange={(itemRarity) =>
              patch({
                itemRarity: itemRarity as TypeSpecificEditorState["itemRarity"],
              })
            }
          />
        </>
      );
    case "vehicle":
      if (readOnly) {
        return (
          <>
            <ReadOnlyField
              label="Sub type"
              value={labelForOption(vehicleSubTypeOptions, fields.vehicleSubType)}
            />
            <ReadOnlyField label="Max speed" value={fields.maxSpeed} />
          </>
        );
      }
      return (
        <>
          <EnumComboBox
            id="card-sub-type"
            label="Sub type"
            value={fields.vehicleSubType}
            options={[...vehicleSubTypeOptions]}
            disabled={disabled}
            onChange={(vehicleSubType) =>
              patch({
                vehicleSubType:
                  vehicleSubType as TypeSpecificEditorState["vehicleSubType"],
              })
            }
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="card-max-speed" className={inspectorFieldLabelClassName}>
              Max speed
            </label>
            <Input
              id="card-max-speed"
              value={fields.maxSpeed}
              isDisabled={disabled}
              onValueChange={(maxSpeed) => patch({ maxSpeed })}
              classNames={inspectorInlineInputClassNames}
            />
          </div>
        </>
      );
    case "flora":
      if (readOnly) {
        return (
          <ReadOnlyField
            label="Toxicity"
            value={labelForOption(floraToxicityOptions, fields.floraToxicity)}
          />
        );
      }
      return (
        <EnumComboBox
          id="card-toxicity"
          label="Toxicity"
          value={fields.floraToxicity}
          options={[...floraToxicityOptions]}
          disabled={disabled}
          onChange={(floraToxicity) =>
            patch({
              floraToxicity:
                floraToxicity as TypeSpecificEditorState["floraToxicity"],
            })
          }
        />
      );
    case "fauna":
      if (readOnly) {
        return (
          <ReadOnlyField
            label="Diet"
            value={
              fields.faunaDiet
                ? labelForOption(faunaDietOptions, fields.faunaDiet)
                : ""
            }
          />
        );
      }
      return (
        <EnumComboBox
          id="card-diet"
          label="Diet"
          value={fields.faunaDiet ?? ""}
          options={[...faunaDietOptions]}
          allowEmpty
          disabled={disabled}
          onChange={(faunaDiet) =>
            patch({
              faunaDiet: faunaDiet as TypeSpecificEditorState["faunaDiet"],
            })
          }
        />
      );
    case "structure":
      if (readOnly) {
        return (
          <ReadOnlyField
            label="Condition"
            value={labelForOption(
              structureConditionOptions,
              fields.structureCondition,
            )}
          />
        );
      }
      return (
        <EnumComboBox
          id="card-condition"
          label="Condition"
          value={fields.structureCondition}
          options={[...structureConditionOptions]}
          disabled={disabled}
          onChange={(structureCondition) =>
            patch({
              structureCondition:
                structureCondition as TypeSpecificEditorState["structureCondition"],
            })
          }
        />
      );
    case "species":
      if (readOnly) {
        return (
          <ReadOnlyField
            label="Average lifespan"
            value={fields.averageLifespan}
          />
        );
      }
      return (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="card-lifespan"
            className={inspectorFieldLabelClassName}
          >
            Average lifespan
          </label>
          <Input
            id="card-lifespan"
            value={fields.averageLifespan}
            isDisabled={disabled}
            onValueChange={(averageLifespan) => patch({ averageLifespan })}
            classNames={inspectorInlineInputClassNames}
          />
        </div>
      );
    case "building":
      return readOnly ? (
        <p className="text-sm text-wn-mono-500">No type-specific fields.</p>
      ) : null;
    default:
      return null;
  }
}

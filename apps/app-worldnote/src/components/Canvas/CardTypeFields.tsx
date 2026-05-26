import type { WorldCard } from "@worldnote/shared";
import { EnumComboBox } from "@worldnote/ui";
import { Input } from "@heroui/react";
import { modalFieldLabelClassName } from "../Onboarding/fieldClassNames.js";
import { darkFieldInputClassNames } from "../Onboarding/fieldClassNames.js";
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

type CardTypeFieldsProps = {
  cardType: WorldCard["card_type"];
  fields: TypeSpecificEditorState;
  onChange: (next: TypeSpecificEditorState) => void;
  disabled?: boolean;
};

export function CardTypeFields({
  cardType,
  fields,
  onChange,
  disabled = false,
}: CardTypeFieldsProps) {
  const patch = (partial: Partial<TypeSpecificEditorState>) =>
    onChange({ ...fields, ...partial });

  switch (cardType) {
    case "character":
      return (
        <div className="flex flex-col gap-1">
          <label htmlFor="card-birthdate" className={modalFieldLabelClassName}>
            Birthdate
          </label>
          <Input
            id="card-birthdate"
            placeholder="Year 402"
            value={fields.birthdate}
            isDisabled={disabled}
            onValueChange={(birthdate) => patch({ birthdate })}
            classNames={darkFieldInputClassNames}
          />
        </div>
      );
    case "location":
      return (
        <div className="flex flex-col gap-1">
          <label htmlFor="card-coordinates" className={modalFieldLabelClassName}>
            Coordinates
          </label>
          <Input
            id="card-coordinates"
            placeholder="12.4, -3.1"
            value={fields.coordinates}
            isDisabled={disabled}
            onValueChange={(coordinates) => patch({ coordinates })}
            classNames={darkFieldInputClassNames}
          />
        </div>
      );
    case "item":
      return (
        <>
          <div className="flex flex-col gap-1">
            <label htmlFor="card-weight" className={modalFieldLabelClassName}>
              Weight
            </label>
            <Input
              id="card-weight"
              type="number"
              value={fields.itemWeight}
              isDisabled={disabled}
              onValueChange={(itemWeight) => patch({ itemWeight })}
              classNames={darkFieldInputClassNames}
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
            <label htmlFor="card-max-speed" className={modalFieldLabelClassName}>
              Max speed
            </label>
            <Input
              id="card-max-speed"
              value={fields.maxSpeed}
              isDisabled={disabled}
              onValueChange={(maxSpeed) => patch({ maxSpeed })}
              classNames={darkFieldInputClassNames}
            />
          </div>
        </>
      );
    case "flora":
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
      return (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="card-lifespan"
            className={modalFieldLabelClassName}
          >
            Average lifespan
          </label>
          <Input
            id="card-lifespan"
            value={fields.averageLifespan}
            isDisabled={disabled}
            onValueChange={(averageLifespan) => patch({ averageLifespan })}
            classNames={darkFieldInputClassNames}
          />
        </div>
      );
    case "building":
      return null;
    default:
      return null;
  }
}

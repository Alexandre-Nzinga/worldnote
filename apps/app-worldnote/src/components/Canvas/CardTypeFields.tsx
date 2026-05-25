import type { WorldCard } from "@worldnote/shared";
import { modalFieldLabelClassName } from "../Onboarding/fieldClassNames.js";
import { darkFieldInputClassNames } from "../Onboarding/fieldClassNames.js";
import { Input } from "@heroui/react";
import type { TypeSpecificEditorState } from "./cardEditorTypes.js";

const selectClassName =
  "h-10 w-full rounded-xl border border-wn-mono-700 bg-wn-mono-950 px-3 text-sm text-wn-mono-50 outline-none focus:border-wn-mono-500";

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
          <div className="flex flex-col gap-1">
            <label htmlFor="card-rarity" className={modalFieldLabelClassName}>
              Rarity
            </label>
            <select
              id="card-rarity"
              disabled={disabled}
              value={fields.itemRarity}
              onChange={(e) =>
                patch({
                  itemRarity: e.target.value as TypeSpecificEditorState["itemRarity"],
                })
              }
              className={selectClassName}
            >
              <option value="">—</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
              <option value="artifact">Artifact</option>
            </select>
          </div>
        </>
      );
    case "vehicle":
      return (
        <>
          <div className="flex flex-col gap-1">
            <label htmlFor="card-sub-type" className={modalFieldLabelClassName}>
              Sub type
            </label>
            <select
              id="card-sub-type"
              disabled={disabled}
              value={fields.vehicleSubType}
              onChange={(e) =>
                patch({
                  vehicleSubType: e.target
                    .value as TypeSpecificEditorState["vehicleSubType"],
                })
              }
              className={selectClassName}
            >
              <option value="car">Car</option>
              <option value="ship">Ship</option>
              <option value="spaceship">Spaceship</option>
              <option value="mount">Mount</option>
              <option value="bike">Bike</option>
              <option value="other">Other</option>
            </select>
          </div>
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
        <div className="flex flex-col gap-1">
          <label htmlFor="card-toxicity" className={modalFieldLabelClassName}>
            Toxicity
          </label>
          <select
            id="card-toxicity"
            disabled={disabled}
            value={fields.floraToxicity}
            onChange={(e) =>
              patch({
                floraToxicity: e.target
                  .value as TypeSpecificEditorState["floraToxicity"],
              })
            }
            className={selectClassName}
          >
            <option value="harmless">Harmless</option>
            <option value="medicinal">Medicinal</option>
            <option value="toxic">Toxic</option>
            <option value="lethal">Lethal</option>
          </select>
        </div>
      );
    case "fauna":
      return (
        <div className="flex flex-col gap-1">
          <label htmlFor="card-diet" className={modalFieldLabelClassName}>
            Diet
          </label>
          <select
            id="card-diet"
            disabled={disabled}
            value={fields.faunaDiet}
            onChange={(e) =>
              patch({
                faunaDiet: e.target.value as TypeSpecificEditorState["faunaDiet"],
              })
            }
            className={selectClassName}
          >
            <option value="">—</option>
            <option value="carnivore">Carnivore</option>
            <option value="herbivore">Herbivore</option>
            <option value="omnivore">Omnivore</option>
            <option value="detritivore">Detritivore</option>
          </select>
        </div>
      );
    case "structure":
      return (
        <div className="flex flex-col gap-1">
          <label htmlFor="card-condition" className={modalFieldLabelClassName}>
            Condition
          </label>
          <select
            id="card-condition"
            disabled={disabled}
            value={fields.structureCondition}
            onChange={(e) =>
              patch({
                structureCondition: e.target
                  .value as TypeSpecificEditorState["structureCondition"],
              })
            }
            className={selectClassName}
          >
            <option value="intact">Intact</option>
            <option value="damaged">Damaged</option>
            <option value="ruined">Ruined</option>
            <option value="under_construction">Under construction</option>
          </select>
        </div>
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

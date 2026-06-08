import {
  VEHICLE_SUB_TYPE_LABELS,
  VEHICLE_SUB_TYPE_VALUES,
  formatMeasurementStringValue,
  formatMeasurementValue,
  measurementEditorValue,
  measurementFieldLabel,
  measurementInputPlaceholder,
  measurementStoredValue,
  parseMeasurementInput,
  toDisplayValue,
  type CharacterCard,
  type FaunaCard,
  type FloraCard,
  type ItemCard,
  type StructureCard,
  type VehicleCard,
  type WorldCard,
} from "@worldnote/shared";
import { EnumComboBox } from "@worldnote/ui";
import { Input } from "@heroui/react";
import { useSettings } from "../../../hooks/useSettings.js";
import { normalizeUnitSystem } from "../../../services/settings/unitSystem.js";
import {
  inspectorFieldLabelClassName,
  inspectorFieldValueClassName,
  inspectorInlineInputClassNames,
} from "../inspector/inspectorFieldStyles.js";
import type { TypeSpecificEditorState } from "./cardEditorTypes.js";

const itemRarityOptions = [
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
  { value: "epic", label: "Epic" },
  { value: "legendary", label: "Legendary" },
  { value: "artifact", label: "Artifact" },
] as const;

const vehicleSubTypeOptions = VEHICLE_SUB_TYPE_VALUES.map((value) => ({
  value,
  label: VEHICLE_SUB_TYPE_LABELS[value],
}));

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

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "x", label: "X" },
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
  const unitSystem = normalizeUnitSystem(
    useSettings((state) => state.settings?.unitSystem),
  );
  const patch = (partial: Partial<TypeSpecificEditorState>) =>
    onChange({ ...fields, ...partial });

  switch (cardType) {
    case "character":
      if (readOnly) {
        return (
          <>
            <ReadOnlyField label="Birth year" value={fields.startYear} />
            <ReadOnlyField label="Death year" value={fields.endYear} />
            <ReadOnlyField
              label="Gender"
              value={
                fields.gender
                  ? labelForOption(genderOptions, fields.gender)
                  : ""
              }
            />
          </>
        );
      }
      return (
        <>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="card-start-year"
              className={inspectorFieldLabelClassName}
            >
              Birth year
            </label>
            <Input
              id="card-start-year"
              type="number"
              placeholder="-402"
              value={fields.startYear}
              isDisabled={disabled}
              onValueChange={(startYear) => patch({ startYear })}
              classNames={inspectorInlineInputClassNames}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="card-end-year"
              className={inspectorFieldLabelClassName}
            >
              Death year
            </label>
            <Input
              id="card-end-year"
              type="number"
              placeholder="450"
              value={fields.endYear}
              isDisabled={disabled}
              onValueChange={(endYear) => patch({ endYear })}
              classNames={inspectorInlineInputClassNames}
            />
          </div>
          <EnumComboBox<NonNullable<CharacterCard["gender"]>>
            id="card-gender"
            label="Gender"
            labelClassName={inspectorFieldLabelClassName}
            value={fields.gender ?? ""}
            options={[...genderOptions]}
            allowEmpty
            disabled={disabled}
            onChange={(gender) => patch({ gender })}
          />
        </>
      );
    case "location":
      return readOnly ? (
        <p className="text-sm text-wn-mono-500">No type-specific fields.</p>
      ) : null;
    case "item": {
      const canonicalWeight = fields.itemWeight
        ? Number(fields.itemWeight)
        : Number.NaN;
      const hasCanonicalWeight = Number.isFinite(canonicalWeight);
      const weightDisplayValue = hasCanonicalWeight
        ? String(toDisplayValue(canonicalWeight, "weight", unitSystem))
        : fields.itemWeight;
      const weightReadOnlyValue = hasCanonicalWeight
        ? formatMeasurementValue(canonicalWeight, "weight", unitSystem)
        : fields.itemWeight;

      if (readOnly) {
        return (
          <>
            <ReadOnlyField
              label={measurementFieldLabel("weight", unitSystem)}
              value={weightReadOnlyValue}
            />
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
            <label
              htmlFor="card-weight"
              className={inspectorFieldLabelClassName}
            >
              {measurementFieldLabel("weight", unitSystem)}
            </label>
            <Input
              id="card-weight"
              type="number"
              placeholder={measurementInputPlaceholder("weight", unitSystem)}
              value={weightDisplayValue}
              isDisabled={disabled}
              onValueChange={(displayWeight) => {
                const nextCanonical = parseMeasurementInput(
                  displayWeight,
                  "weight",
                  unitSystem,
                );
                patch({
                  itemWeight:
                    nextCanonical !== undefined
                      ? String(nextCanonical)
                      : displayWeight.trim(),
                });
              }}
              classNames={inspectorInlineInputClassNames}
            />
          </div>
          <EnumComboBox<NonNullable<ItemCard["rarity"]>>
            id="card-rarity"
            label="Rarity"
            labelClassName={inspectorFieldLabelClassName}
            value={fields.itemRarity ?? ""}
            options={[...itemRarityOptions]}
            allowEmpty
            disabled={disabled}
            onChange={(itemRarity) => patch({ itemRarity })}
          />
        </>
      );
    }
    case "vehicle":
      if (readOnly) {
        return (
          <>
            <ReadOnlyField
              label="Sub type"
              value={labelForOption(
                vehicleSubTypeOptions,
                fields.vehicleSubType,
              )}
            />
            <ReadOnlyField
              label={measurementFieldLabel("speed", unitSystem, "Max speed")}
              value={formatMeasurementStringValue(
                fields.maxSpeed,
                "speed",
                unitSystem,
              )}
            />
          </>
        );
      }
      return (
        <>
          <EnumComboBox<VehicleCard["sub_type"]>
            id="card-sub-type"
            label="Sub type"
            labelClassName={inspectorFieldLabelClassName}
            value={fields.vehicleSubType}
            options={[...vehicleSubTypeOptions]}
            disabled={disabled}
            onChange={(vehicleSubType) => patch({ vehicleSubType })}
          />
          <div className="flex flex-col gap-1">
            <label
              htmlFor="card-max-speed"
              className={inspectorFieldLabelClassName}
            >
              {measurementFieldLabel("speed", unitSystem, "Max speed")}
            </label>
            <Input
              id="card-max-speed"
              placeholder={measurementInputPlaceholder("speed", unitSystem)}
              value={measurementEditorValue(
                fields.maxSpeed,
                "speed",
                unitSystem,
              )}
              isDisabled={disabled}
              onValueChange={(displaySpeed) =>
                patch({
                  maxSpeed: measurementStoredValue(
                    displaySpeed,
                    "speed",
                    unitSystem,
                  ),
                })
              }
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
        <EnumComboBox<FloraCard["toxicity_level"]>
          id="card-toxicity"
          label="Toxicity"
          labelClassName={inspectorFieldLabelClassName}
          value={fields.floraToxicity}
          options={[...floraToxicityOptions]}
          disabled={disabled}
          onChange={(floraToxicity) => patch({ floraToxicity })}
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
        <EnumComboBox<NonNullable<FaunaCard["diet"]>>
          id="card-diet"
          label="Diet"
          labelClassName={inspectorFieldLabelClassName}
          value={fields.faunaDiet ?? ""}
          options={[...faunaDietOptions]}
          allowEmpty
          disabled={disabled}
          onChange={(faunaDiet) => patch({ faunaDiet })}
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
        <EnumComboBox<StructureCard["condition"]>
          id="card-condition"
          label="Condition"
          labelClassName={inspectorFieldLabelClassName}
          value={fields.structureCondition}
          options={[...structureConditionOptions]}
          disabled={disabled}
          onChange={(structureCondition) => patch({ structureCondition })}
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
    case "planet":
      if (readOnly) {
        return <ReadOnlyField label="Planet type" value={fields.planetType} />;
      }
      return (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="card-planet-type"
            className={inspectorFieldLabelClassName}
          >
            Planet type
          </label>
          <Input
            id="card-planet-type"
            placeholder="Terrestrial, gas giant…"
            value={fields.planetType}
            isDisabled={disabled}
            onValueChange={(planetType) => patch({ planetType })}
            classNames={inspectorInlineInputClassNames}
          />
        </div>
      );
    case "organization":
      if (readOnly) {
        return (
          <ReadOnlyField label="Founding date" value={fields.foundingDate} />
        );
      }
      return (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="card-founding-date"
            className={inspectorFieldLabelClassName}
          >
            Founding date
          </label>
          <Input
            id="card-founding-date"
            value={fields.foundingDate}
            isDisabled={disabled}
            onValueChange={(foundingDate) => patch({ foundingDate })}
            classNames={inspectorInlineInputClassNames}
          />
        </div>
      );
    case "polity":
      if (readOnly) {
        return (
          <ReadOnlyField
            label="Government type"
            value={fields.governmentType}
          />
        );
      }
      return (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="card-government-type"
            className={inspectorFieldLabelClassName}
          >
            Government type
          </label>
          <Input
            id="card-government-type"
            value={fields.governmentType}
            isDisabled={disabled}
            onValueChange={(governmentType) => patch({ governmentType })}
            classNames={inspectorInlineInputClassNames}
          />
        </div>
      );
    case "event":
      if (readOnly) {
        return (
          <>
            <ReadOnlyField label="Start year" value={fields.eventStartYear} />
            <ReadOnlyField label="End year" value={fields.eventEndYear} />
          </>
        );
      }
      return (
        <>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="card-event-start-year"
              className={inspectorFieldLabelClassName}
            >
              Start year
            </label>
            <Input
              id="card-event-start-year"
              type="number"
              placeholder="10191"
              value={fields.eventStartYear}
              isDisabled={disabled}
              onValueChange={(eventStartYear) => patch({ eventStartYear })}
              classNames={inspectorInlineInputClassNames}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="card-event-end-year"
              className={inspectorFieldLabelClassName}
            >
              End year
            </label>
            <Input
              id="card-event-end-year"
              type="number"
              placeholder="10200"
              value={fields.eventEndYear}
              isDisabled={disabled}
              onValueChange={(eventEndYear) => patch({ eventEndYear })}
              classNames={inspectorInlineInputClassNames}
            />
          </div>
        </>
      );
    case "family":
      if (readOnly) {
        return <ReadOnlyField label="Motto" value={fields.motto} />;
      }
      return (
        <div className="flex flex-col gap-1">
          <label htmlFor="card-motto" className={inspectorFieldLabelClassName}>
            Motto
          </label>
          <Input
            id="card-motto"
            value={fields.motto}
            isDisabled={disabled}
            onValueChange={(motto) => patch({ motto })}
            classNames={inspectorInlineInputClassNames}
          />
        </div>
      );
    case "group":
      if (readOnly) {
        return <ReadOnlyField label="Group type" value={fields.groupType} />;
      }
      return (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="card-group-type"
            className={inspectorFieldLabelClassName}
          >
            Group type
          </label>
          <Input
            id="card-group-type"
            placeholder="Party, squad, crew…"
            value={fields.groupType}
            isDisabled={disabled}
            onValueChange={(groupType) => patch({ groupType })}
            classNames={inspectorInlineInputClassNames}
          />
        </div>
      );
    case "star":
      if (readOnly) {
        return (
          <ReadOnlyField label="Spectral class" value={fields.spectralClass} />
        );
      }
      return (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="card-spectral-class"
            className={inspectorFieldLabelClassName}
          >
            Spectral class
          </label>
          <Input
            id="card-spectral-class"
            placeholder="G2V, M-class…"
            value={fields.spectralClass}
            isDisabled={disabled}
            onValueChange={(spectralClass) => patch({ spectralClass })}
            classNames={inspectorInlineInputClassNames}
          />
        </div>
      );
    case "moon":
      if (readOnly) {
        return (
          <ReadOnlyField label="Orbital period" value={fields.orbitalPeriod} />
        );
      }
      return (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="card-orbital-period"
            className={inspectorFieldLabelClassName}
          >
            Orbital period
          </label>
          <Input
            id="card-orbital-period"
            value={fields.orbitalPeriod}
            isDisabled={disabled}
            onValueChange={(orbitalPeriod) => patch({ orbitalPeriod })}
            classNames={inspectorInlineInputClassNames}
          />
        </div>
      );
    case "asteroid":
      if (readOnly) {
        return <ReadOnlyField label="Composition" value={fields.composition} />;
      }
      return (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="card-composition"
            className={inspectorFieldLabelClassName}
          >
            Composition
          </label>
          <Input
            id="card-composition"
            value={fields.composition}
            isDisabled={disabled}
            onValueChange={(composition) => patch({ composition })}
            classNames={inspectorInlineInputClassNames}
          />
        </div>
      );
    case "satellite":
      if (readOnly) {
        return <ReadOnlyField label="Orbit type" value={fields.orbitType} />;
      }
      return (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="card-orbit-type"
            className={inspectorFieldLabelClassName}
          >
            Orbit type
          </label>
          <Input
            id="card-orbit-type"
            value={fields.orbitType}
            isDisabled={disabled}
            onValueChange={(orbitType) => patch({ orbitType })}
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

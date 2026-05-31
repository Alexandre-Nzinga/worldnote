import type {
  BuildingCard,
  CardImagePosition,
  CharacterCard,
  FaunaCard,
  FloraCard,
  ItemCard,
  LocationCard,
  SpeciesCard,
  StructureCard,
  VehicleCard,
  WorldCard,
} from "@worldnote/shared";

type CardBaseFields = {
  id: string;
  name: string;
  parent_id: string | null;
  position: { x: number; y: number };
  tags: string[];
  description?: string;
  subtitle?: string;
  lore?: string;
  image_path?: string;
  image_position?: CardImagePosition;
  custom_properties: Record<string, unknown>;
};

export type TypeSpecificEditorState = {
  birthdate: string;
  coordinates: string;
  itemWeight: string;
  itemRarity: ItemCard["rarity"] | "";
  vehicleSubType: VehicleCard["sub_type"];
  maxSpeed: string;
  floraToxicity: FloraCard["toxicity_level"];
  faunaDiet: FaunaCard["diet"] | "";
  structureCondition: StructureCard["condition"];
  averageLifespan: string;
};

export function defaultTypeFields(
  cardType: WorldCard["card_type"],
): TypeSpecificEditorState {
  return {
    birthdate: "",
    coordinates: "",
    itemWeight: "",
    itemRarity: "",
    vehicleSubType: "other",
    maxSpeed: "",
    floraToxicity: "harmless",
    faunaDiet: "",
    structureCondition: "intact",
    averageLifespan: "",
  };
}

export function typeFieldsFromCard(card: WorldCard): TypeSpecificEditorState {
  const defaults = defaultTypeFields(card.card_type);
  switch (card.card_type) {
    case "character":
      return { ...defaults, birthdate: card.birthdate ?? "" };
    case "location":
      return { ...defaults, coordinates: card.coordinates ?? "" };
    case "item":
      return {
        ...defaults,
        itemWeight: card.weight !== undefined ? String(card.weight) : "",
        itemRarity: card.rarity ?? "",
      };
    case "vehicle":
      return {
        ...defaults,
        vehicleSubType: card.sub_type,
        maxSpeed: card.max_speed ?? "",
      };
    case "flora":
      return { ...defaults, floraToxicity: card.toxicity_level };
    case "fauna":
      return { ...defaults, faunaDiet: card.diet ?? "" };
    case "structure":
      return { ...defaults, structureCondition: card.condition };
    case "species":
      return { ...defaults, averageLifespan: card.average_lifespan ?? "" };
    default:
      return defaults;
  }
}

export function buildWorldCard(
  activeCard: WorldCard,
  base: CardBaseFields,
  typeFields: TypeSpecificEditorState,
): WorldCard {
  switch (activeCard.card_type) {
    case "character":
      return {
        ...base,
        card_type: "character",
        birthdate: typeFields.birthdate.trim() || undefined,
      } satisfies CharacterCard;
    case "location":
      return {
        ...base,
        card_type: "location",
        coordinates: typeFields.coordinates.trim() || undefined,
      } satisfies LocationCard;
    case "item": {
      const weight = typeFields.itemWeight.trim();
      return {
        ...base,
        card_type: "item",
        weight: weight ? Number(weight) : undefined,
        rarity: typeFields.itemRarity || undefined,
      } satisfies ItemCard;
    }
    case "vehicle":
      return {
        ...base,
        card_type: "vehicle",
        sub_type: typeFields.vehicleSubType,
        max_speed: typeFields.maxSpeed.trim() || undefined,
      } satisfies VehicleCard;
    case "flora":
      return {
        ...base,
        card_type: "flora",
        toxicity_level: typeFields.floraToxicity,
      } satisfies FloraCard;
    case "fauna":
      return {
        ...base,
        card_type: "fauna",
        diet: typeFields.faunaDiet || undefined,
      } satisfies FaunaCard;
    case "building":
      return {
        ...base,
        card_type: "building",
      } satisfies BuildingCard;
    case "structure":
      return {
        ...base,
        card_type: "structure",
        condition: typeFields.structureCondition,
      } satisfies StructureCard;
    case "species":
      return {
        ...base,
        card_type: "species",
        average_lifespan: typeFields.averageLifespan.trim() || undefined,
      } satisfies SpeciesCard;
    default: {
      const _exhaustive: never = activeCard;
      return _exhaustive;
    }
  }
}

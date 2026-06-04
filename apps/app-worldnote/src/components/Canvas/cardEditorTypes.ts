import type {
  AsteroidCard,
  BuildingCard,
  CardImagePosition,
  CharacterCard,
  EventCard,
  FamilyCard,
  FaunaCard,
  FloraCard,
  GroupCard,
  ItemCard,
  LocationCard,
  MoonCard,
  OrganizationCard,
  PlanetCard,
  PolityCard,
  SatelliteCard,
  SpeciesCard,
  StarCard,
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
  /** Family heraldic crest asset path. */
  crest_path?: string;
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
  planetType: string;
  foundingDate: string;
  governmentType: string;
  eventDate: string;
  motto: string;
  groupType: string;
  spectralClass: string;
  orbitalPeriod: string;
  composition: string;
  orbitType: string;
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
    planetType: "",
    foundingDate: "",
    governmentType: "",
    eventDate: "",
    motto: "",
    groupType: "",
    spectralClass: "",
    orbitalPeriod: "",
    composition: "",
    orbitType: "",
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
    case "planet":
      return { ...defaults, planetType: card.planet_type ?? "" };
    case "organization":
      return { ...defaults, foundingDate: card.founding_date ?? "" };
    case "polity":
      return { ...defaults, governmentType: card.government_type ?? "" };
    case "event":
      return { ...defaults, eventDate: card.event_date ?? "" };
    case "family":
      return { ...defaults, motto: card.motto ?? "" };
    case "group":
      return { ...defaults, groupType: card.group_type ?? "" };
    case "star":
      return { ...defaults, spectralClass: card.spectral_class ?? "" };
    case "moon":
      return { ...defaults, orbitalPeriod: card.orbital_period ?? "" };
    case "asteroid":
      return { ...defaults, composition: card.composition ?? "" };
    case "satellite":
      return { ...defaults, orbitType: card.orbit_type ?? "" };
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
    case "planet":
      return {
        ...base,
        card_type: "planet",
        planet_type: typeFields.planetType.trim() || undefined,
      } satisfies PlanetCard;
    case "organization":
      return {
        ...base,
        card_type: "organization",
        founding_date: typeFields.foundingDate.trim() || undefined,
      } satisfies OrganizationCard;
    case "polity":
      return {
        ...base,
        card_type: "polity",
        government_type: typeFields.governmentType.trim() || undefined,
      } satisfies PolityCard;
    case "event":
      return {
        ...base,
        card_type: "event",
        event_date: typeFields.eventDate.trim() || undefined,
      } satisfies EventCard;
    case "family":
      return {
        ...base,
        card_type: "family",
        motto: typeFields.motto.trim() || undefined,
        crest_path: base.crest_path?.trim() || undefined,
      } satisfies FamilyCard;
    case "group":
      return {
        ...base,
        card_type: "group",
        group_type: typeFields.groupType.trim() || undefined,
      } satisfies GroupCard;
    case "star":
      return {
        ...base,
        card_type: "star",
        spectral_class: typeFields.spectralClass.trim() || undefined,
      } satisfies StarCard;
    case "moon":
      return {
        ...base,
        card_type: "moon",
        orbital_period: typeFields.orbitalPeriod.trim() || undefined,
      } satisfies MoonCard;
    case "asteroid":
      return {
        ...base,
        card_type: "asteroid",
        composition: typeFields.composition.trim() || undefined,
      } satisfies AsteroidCard;
    case "satellite":
      return {
        ...base,
        card_type: "satellite",
        orbit_type: typeFields.orbitType.trim() || undefined,
      } satisfies SatelliteCard;
    case "law":
      return { ...base, card_type: "law" };
    case "religion":
      return { ...base, card_type: "religion" };
    case "language":
      return { ...base, card_type: "language" };
    case "culture":
      return { ...base, card_type: "culture" };
    case "spell":
      return { ...base, card_type: "spell" };
    case "disease":
      return { ...base, card_type: "disease" };
    case "disaster":
      return { ...base, card_type: "disaster" };
    case "combat_style":
      return { ...base, card_type: "combat_style" };
    default: {
      const _exhaustive: never = activeCard;
      return _exhaustive;
    }
  }
}

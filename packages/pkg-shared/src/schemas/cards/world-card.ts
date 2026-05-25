import { z } from "zod";
import { BuildingCardSchema } from "./atoms/building.js";
import { CharacterCardSchema } from "./atoms/character.js";
import { FaunaCardSchema } from "./atoms/fauna.js";
import { FloraCardSchema } from "./atoms/flora.js";
import { ItemCardSchema } from "./atoms/item.js";
import { StructureCardSchema } from "./atoms/structure.js";
import { VehicleCardSchema } from "./atoms/vehicle.js";
import { LocationCardSchema } from "./molecules/location.js";
import { SpeciesCardSchema } from "./molecules/species.js";

export const WorldCardSchema = z.discriminatedUnion("card_type", [
  CharacterCardSchema,
  LocationCardSchema,
  ItemCardSchema,
  VehicleCardSchema,
  FloraCardSchema,
  FaunaCardSchema,
  BuildingCardSchema,
  StructureCardSchema,
  SpeciesCardSchema,
]);

export type WorldCard = z.infer<typeof WorldCardSchema>;

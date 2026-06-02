import { z } from "zod";
import { BuildingCardSchema } from "./atoms/building.js";
import { CharacterCardSchema } from "./atoms/character.js";
import { FaunaCardSchema } from "./atoms/fauna.js";
import { FloraCardSchema } from "./atoms/flora.js";
import { ItemCardSchema } from "./atoms/item.js";
import { StructureCardSchema } from "./atoms/structure.js";
import { VehicleCardSchema } from "./atoms/vehicle.js";
import { CombatStyleCardSchema } from "./bonds/combat-style.js";
import { CultureCardSchema } from "./bonds/culture.js";
import { DisasterCardSchema } from "./bonds/disaster.js";
import { DiseaseCardSchema } from "./bonds/disease.js";
import { LanguageCardSchema } from "./bonds/language.js";
import { LawCardSchema } from "./bonds/law.js";
import { ReligionCardSchema } from "./bonds/religion.js";
import { SpellCardSchema } from "./bonds/spell.js";
import { AsteroidCardSchema } from "./molecules/asteroid.js";
import { EventCardSchema } from "./molecules/event.js";
import { FamilyCardSchema } from "./molecules/family.js";
import { GroupCardSchema } from "./molecules/group.js";
import { LocationCardSchema } from "./molecules/location.js";
import { MoonCardSchema } from "./molecules/moon.js";
import { OrganizationCardSchema } from "./molecules/organization.js";
import { PlanetCardSchema } from "./molecules/planet.js";
import { PolityCardSchema } from "./molecules/polity.js";
import { SatelliteCardSchema } from "./molecules/satellite.js";
import { SpeciesCardSchema } from "./molecules/species.js";
import { StarCardSchema } from "./molecules/star.js";

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
  PlanetCardSchema,
  OrganizationCardSchema,
  PolityCardSchema,
  EventCardSchema,
  FamilyCardSchema,
  GroupCardSchema,
  StarCardSchema,
  MoonCardSchema,
  AsteroidCardSchema,
  SatelliteCardSchema,
  LawCardSchema,
  ReligionCardSchema,
  LanguageCardSchema,
  CultureCardSchema,
  SpellCardSchema,
  DiseaseCardSchema,
  DisasterCardSchema,
  CombatStyleCardSchema,
]);

export type WorldCard = z.infer<typeof WorldCardSchema>;

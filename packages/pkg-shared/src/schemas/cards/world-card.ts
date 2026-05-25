import { z } from "zod";
import { CharacterCardSchema } from "./atoms/character.js";
import { LocationCardSchema } from "./molecules/location.js";

export const WorldCardSchema = z.discriminatedUnion("card_type", [
  CharacterCardSchema,
  LocationCardSchema,
]);

export type WorldCard = z.infer<typeof WorldCardSchema>;

import { z } from "zod";
import { CharacterCardSchema } from "./character.js";
import { LocationCardSchema } from "./location.js";

export const WorldCardSchema = z.discriminatedUnion("card_type", [
  CharacterCardSchema,
  LocationCardSchema,
]);

export type WorldCard = z.infer<typeof WorldCardSchema>;

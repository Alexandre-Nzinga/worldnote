import { z } from "zod";
import { BaseCardSchema } from "./base-card.js";

export const CharacterCardSchema = BaseCardSchema.extend({
  card_type: z.literal("character"),
  birthdate: z.string().optional(),
});

export type CharacterCard = z.infer<typeof CharacterCardSchema>;

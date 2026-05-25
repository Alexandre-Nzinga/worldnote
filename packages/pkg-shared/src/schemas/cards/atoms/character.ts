import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const CharacterCardSchema = BaseCardSchema.extend({
  card_type: z.literal("character"),
  birthdate: z.string().optional(),
  deathdate: z.string().optional(),
  gender: z.enum(["male", "female", "x"]).optional(),
  race: z.string().optional(),
  appearance: z.string().optional(),
  personality: z.string().optional(),
});

export type CharacterCard = z.infer<typeof CharacterCardSchema>;

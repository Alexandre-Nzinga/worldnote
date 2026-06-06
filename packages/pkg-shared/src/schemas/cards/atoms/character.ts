import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";
import { ChronologyFieldsSchema } from "../../timeline/chronology-fields.js";

export const CharacterCardSchema = BaseCardSchema.extend({
  card_type: z.literal("character"),
  ...ChronologyFieldsSchema.shape,
  gender: z.enum(["male", "female", "x"]).optional(),
  race: z.string().optional(),
  appearance: z.string().optional(),
  personality: z.string().optional(),
});

export type CharacterCard = z.infer<typeof CharacterCardSchema>;

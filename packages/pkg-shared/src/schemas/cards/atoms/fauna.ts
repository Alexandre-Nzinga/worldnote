import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const FaunaDietSchema = z.enum([
  "carnivore",
  "herbivore",
  "omnivore",
  "detritivore",
]);

export const FaunaCardSchema = BaseCardSchema.extend({
  card_type: z.literal("fauna"),
  diet: FaunaDietSchema.optional(),
});

export type FaunaCard = z.infer<typeof FaunaCardSchema>;

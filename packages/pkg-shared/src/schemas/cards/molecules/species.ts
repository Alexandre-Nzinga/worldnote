import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const SpeciesCardSchema = BaseCardSchema.extend({
  card_type: z.literal("species"),
  average_lifespan: z.string().optional(),
});

export type SpeciesCard = z.infer<typeof SpeciesCardSchema>;

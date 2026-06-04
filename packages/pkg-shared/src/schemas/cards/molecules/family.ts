import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const FamilyCardSchema = BaseCardSchema.extend({
  card_type: z.literal("family"),
  motto: z.string().optional(),
  /** Heraldic crest / banner shown on the card (separate from cover image). */
  crest_path: z.string().optional(),
});

export type FamilyCard = z.infer<typeof FamilyCardSchema>;

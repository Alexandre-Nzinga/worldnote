import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const FamilyCardSchema = BaseCardSchema.extend({
  card_type: z.literal("family"),
  motto: z.string().optional(),
  /** Heraldic crest / banner shown on the card (separate from cover image). */
  crest_path: z.string().optional(),
  /** Character whose kinship component defines `members` links (auto-synced). */
  anchor_character_id: z.string().uuid().optional(),
});

export type FamilyCard = z.infer<typeof FamilyCardSchema>;

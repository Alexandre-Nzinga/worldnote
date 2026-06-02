import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const FamilyCardSchema = BaseCardSchema.extend({
  card_type: z.literal("family"),
  motto: z.string().optional(),
});

export type FamilyCard = z.infer<typeof FamilyCardSchema>;

import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const FloraToxicitySchema = z.enum([
  "harmless",
  "medicinal",
  "toxic",
  "lethal",
]);

export const FloraCardSchema = BaseCardSchema.extend({
  card_type: z.literal("flora"),
  toxicity_level: FloraToxicitySchema.default("harmless"),
});

export type FloraCard = z.infer<typeof FloraCardSchema>;

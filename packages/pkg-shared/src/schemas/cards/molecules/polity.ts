import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const PolityCardSchema = BaseCardSchema.extend({
  card_type: z.literal("polity"),
  government_type: z.string().optional(),
});

export type PolityCard = z.infer<typeof PolityCardSchema>;

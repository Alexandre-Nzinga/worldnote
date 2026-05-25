import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const BuildingCardSchema = BaseCardSchema.extend({
  card_type: z.literal("building"),
});

export type BuildingCard = z.infer<typeof BuildingCardSchema>;

import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const LocationCardSchema = BaseCardSchema.extend({
  card_type: z.literal("location"),
});

export type LocationCard = z.infer<typeof LocationCardSchema>;

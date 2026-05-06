import { z } from "zod";
import { BaseCardSchema } from "./base-card.js";

export const LocationCardSchema = BaseCardSchema.extend({
  card_type: z.literal("location"),
  coordinates: z.string().optional(),
});

export type LocationCard = z.infer<typeof LocationCardSchema>;

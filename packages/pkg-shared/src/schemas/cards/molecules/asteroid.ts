import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const AsteroidCardSchema = BaseCardSchema.extend({
  card_type: z.literal("asteroid"),
  composition: z.string().optional(),
});

export type AsteroidCard = z.infer<typeof AsteroidCardSchema>;
